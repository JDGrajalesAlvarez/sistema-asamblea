import { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "/src/firebase.js"
import { apartamentos } from "../data/apartamentos";

function FilaAsistente({ asistente }) {
    const [editando, setEditando] = useState(false);
    const [nuevoApto, setNuevoApto] = useState(String(asistente.apto || ""));

    const calcularSumaTotal = (valor) => {
        const texto = String(valor || "");
        if (!texto.trim()) return 0;

        return texto
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "")
            .reduce((total, numApto) => {
                const data = apartamentos[numApto];
                return total + (data ? data.coeficiente : 0);
            }, 0);
    };

    const sumaCoeficientes = calcularSumaTotal(nuevoApto);

    const guardarCambio = async () => {
        if (!asistente.id) return alert("ID no encontrado");
        const coeficienteFinal = Number(sumaCoeficientes.toFixed(2));

        try {
            const asistenteRef = doc(db, "asistentes", asistente.id);
            await updateDoc(asistenteRef, {
                apto: nuevoApto,
                coeficiente: coeficienteFinal
            });

            setEditando(false);
            alert("✅ Registro y coeficiente actualizados");
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
                        <button onClick={() => setEditando(true)} style={{ fontSize: "10px" }}>Editar</button>
                    </div>
                )}
            </td>
            <td>{asistente.nombre}</td>
            <td align="right">
                <b>{Number(sumaCoeficientes.toFixed(2))}%</b>
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

        const q = query(collection(db, "votos"), where("ronda", "==", rondaActual));
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

            <hr />

            <section>
                <h3>Resultados Ronda {rondaActual}</h3>
                <p>Sí: {resultados.si.toFixed(4)}%</p>
                <p>No: {resultados.no.toFixed(4)}%</p>
                <p>Blanco: {resultados.blanco.toFixed(4)}%</p>
            </section>

            <hr />

            <h3>👥 Asistentes ({asistentes.length})</h3>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table border="1" width="100%" style={{ borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#f4f4f4" }}>
                            <th style={{ padding: "8px" }}>Apto (Editable)</th>
                            <th>Nombre</th>
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
