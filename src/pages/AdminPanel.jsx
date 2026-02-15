import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "/src/firebase.js"
import { apartamentos } from "../data/apartamentos";

function FilaAsistente({ asistente }) {
    const [editando, setEditando] = useState(false);
    const [nuevoApto, setNuevoApto] = useState(String(asistente.apto || ""));
    const [aptosRepresentados, setAptosRepresentados] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "asistente_apartamentos"),
            where("asistenteId", "==", asistente.id)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const datos = snapshot.docs.map(doc => doc.data());
            setAptosRepresentados(datos);
        })

        return () => unsub();

    }, [asistente.id])

    const guardarCambio = async () => {
        if (!asistente.id) return alert("ID no encontrado");

        try {
            const lista = nuevoApto
                .split(",")
                .map(a => a.trim())
                .filter(a => a !== "");

            const aptosExistentes = new Set([
                String(asistente.apto),
                ...aptosRepresentados.map(a => String(a.apto))
            ]);

            let sumaNueva = 0;
            let aptosAgregados = [];

            for (let apto of lista) {

                if (aptosExistentes.has(apto)) {
                    alert(`⚠️ El apartamento ${apto} ya existe`);
                    continue;
                }

                const data = apartamentos[apto];
                if (!data) {
                    alert(`⚠️ El apartamento ${apto} no existe en coeficientes`);
                    continue;
                }

                sumaNueva += data.coeficiente;
                aptosAgregados.push(apto);

                await addDoc(collection(db, "asistente_apartamentos"), {
                    asistenteId: asistente.id,
                    apto: apto,
                    coeficiente: data.coeficiente
                });
            }

            if (aptosAgregados.length === 0) {
                alert("No se agregó ningún apartamento nuevo");
                return;
            }

            const coefActual = Number(asistente.coeficiente || 0);
            const nuevoCoef = Number((coefActual + sumaNueva).toFixed(2));

            await updateDoc(doc(db, "asistentes", asistente.id), {
                coeficiente: nuevoCoef
            });

            setEditando(false);
            setNuevoApto("");
            alert(`✅ Agregados: ${aptosAgregados.join(", ")}`);

        } catch (e) {
            console.error(e);
            alert("Error al guardar");
        }
    };
    return (
        <tr>
            <td align="center">
                {editando ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                            type="text"
                            value={nuevoApto}
                            onChange={(e) => setNuevoApto(e.target.value)}
                            style={{ width: "120px" }}
                        />
                        <button onClick={guardarCambio}>✅</button>
                        <button onClick={() => {
                            setEditando(false);
                            setNuevoApto(String(asistente.apto));
                        }}>❌</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: "0 5px" }}>
                        <span>{asistente.apto}</span>
                        <button onClick={() => setEditando(true)} style={{ fontSize: "10px" }}>Agregar Apartamentos</button>
                    </div>
                )}
            </td>

            <td>{asistente.nombre}</td>
            <td>{aptosRepresentados.map(a => a.apto).join(", ")}</td>
            <td align="right">
                <b>{Number(asistente.coeficiente || 0).toFixed(2)}%</b>
            </td>
        </tr>
    );
}

function AdminPanel({ asistentes, totalCoeficiente, rondaActual }) {
    const puedeIniciar = totalCoeficiente >= 50;
    const puedeEspecial = totalCoeficiente >= 70;
    const [resultados, setResultados] = useState({ si: 0, no: 0, blanco: 0 });

    useEffect(() => {
        if (!rondaActual) return;

        const q = query(collection(db, "votacion"), where("ronda", "==", rondaActual));
        const unsub = onSnapshot(q, (snapshot) => {
            let si = 0, no = 0, blanco = 0;
            snapshot.forEach(doc => {
                const v = doc.data();
                const coef = Number(v.coeficiente) || 0;
                if (v.opcion === "si") si += coef;
                if (v.opcion === "no") no += coef;
                if (v.opcion === "blanco") blanco += coef;
            });
            setResultados({ si, no, blanco });
        });

        return () => unsub();
    }, [rondaActual]);


    const exportarCSV = async () => {
        try {
            const snapshot = await getDocs(collection(db, "votos"));

            const votos = [];
            const preguntasSet = new Set();

            snapshot.forEach(docSnap => {
                const v = docSnap.data();
                preguntasSet.add(v.pregunta);
                votos.push(v);
            });

            const preguntas = Array.from(preguntasSet).sort((a, b) => a - b);

            // Agrupar por apartamento individual
            const mapa = {};

            votos.forEach(v => {
                const aptos = String(v.apto)
                    .split(",")
                    .map(a => a.trim())
                    .filter(a => a !== "");

                aptos.forEach(apto => {
                    const key = `${v.nombre}-${apto}`;

                    if (!mapa[key]) {
                        mapa[key] = {
                            nombre: v.nombre,
                            apto: apto,
                            respuestas: {}
                        };
                    }

                    mapa[key].respuestas[v.pregunta] = v.opcion;
                });
            });

            // Construcción del CSV
            let filas = [];

            const encabezado = ["Nombre", "Apto", ...preguntas.map(p => `P${p}`)];
            filas.push(encabezado);

            Object.values(mapa).forEach(registro => {
                const fila = [
                    registro.nombre,
                    registro.apto,
                    ...preguntas.map(p => registro.respuestas[p] || "")
                ];


                filas.push(fila);
            });

            const contenido = "\uFEFF" + filas.map(f => f.join(";")).join("\n");

            const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "resultados_votacion.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);


        } catch (error) {
            console.error(error);
            alert("Error al exportar CSV");
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", fontFamily: "sans-serif" }}>
            <h1>Panel de Administración</h1>

            <section>
                <h3>📊 Estado del Quórum</h3>
                <p>Coeficiente total: <b>{totalCoeficiente.toFixed(2)}%</b></p>
                <p>{puedeIniciar ? "✅ Quórum para Sesionar" : "❌ Quórum Insuficiente"}</p>
                <p>{puedeEspecial ? "🗳️ Quórum para Decisiones Especiales (70%)" : "🚫 No alcanza para decisiones especiales"}</p>
            </section>

            {/* <hr />

            <section>
                <h3>Resultados Ronda {rondaActual}</h3>
                <p>Sí: {resultados.si.toFixed(4)}%</p>
                <p>No: {resultados.no.toFixed(4)}%</p>
            </section> */}

            <hr />

            <h3>👥 Asistentes ({asistentes.length})</h3>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table border="1" width="100%" style={{ borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#f4f4f4" }}>
                            <th style={{ padding: "8px" }}>Apto (Editable)</th>
                            <th>Nombre</th>
                            <th>Apartamentos Representados</th>
                            <th>Coef %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asistentes.map((a) => (
                            <FilaAsistente key={a.id} asistente={a} />
                        ))}
                    </tbody>
                </table>
            </div>
            <hr />
            <button
                onClick={exportarCSV}
                style={{ padding: "8px 12px", cursor: "pointer" }}
            >
                📥 Exportar CSV Final
            </button>

        </div>
    );
}

export default AdminPanel
