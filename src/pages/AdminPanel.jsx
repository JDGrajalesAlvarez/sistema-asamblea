import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "/src/firebase.js"
import { apartamentos } from "../data/apartamentos";
import "../styles/adminPanel.css"

function FilaAsistente({ asistente, todosLosAsistentes }) {
    const [editando, setEditando] = useState(false);
    const [nuevoApto, setNuevoApto] = useState("");
    const [aptosRepresentados, setAptosRepresentados] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "asistente_apartamentos"),
            where("asistenteId", "==", asistente.id)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const datos = snapshot.docs.map(doc => doc.data());
            setAptosRepresentados(datos);
        });

        return () => unsub();
    }, [asistente.id]);

    const guardarCambio = async () => {
        if (!asistente.id) return alert("ID no encontrado");
        if (!nuevoApto.trim()) return alert("Ingresa un número de apartamento");

        try {
            const listaNuevos = nuevoApto
                .split(",")
                .map(a => a.trim())
                .filter(a => a !== "");

            let sumaCoeficienteAAgregar = 0;
            let aptosExitosos = [];

            for (let apto of listaNuevos) {
                // 1. Validar si ya es un asistente principal (Normalizamos a String para comparar)
                const yaEsPrincipal = todosLosAsistentes.find(asist => String(asist.apto) === String(apto));
                if (yaEsPrincipal) {
                    alert(`⚠️ El apto ${apto} ya está registrado como asistente principal.`);
                    continue;
                }

                // 2. Validar en Firebase (Ojo: si en la DB el 'apto' es número, la consulta fallará si envías string)
                // Intentamos buscarlo como String, pero si tus registros son números, hay que convertirlo
                const qValidar = query(
                    collection(db, "asistente_apartamentos"),
                    where("apto", "==", apto) // Asegúrate que el tipo coincida con tu DB
                );

                const querySnapshot = await getDocs(qValidar);

                if (!querySnapshot.empty) {
                    alert(`⚠️ El apto ${apto} ya está siendo representado por otro usuario.`);
                    continue;
                }

                // 3. Obtener coeficiente del objeto 'apartamentos'
                const dataCoef = apartamentos[apto];
                if (!dataCoef) {
                    alert(`⚠️ El apto ${apto} no existe en la base de datos de coeficientes.`);
                    continue;
                }

                const valorCoeficiente = Number(dataCoef.coeficiente) || 0;
                sumaCoeficienteAAgregar += valorCoeficiente;
                aptosExitosos.push(apto);

                // 4. Registrar la representación
                await addDoc(collection(db, "asistente_apartamentos"), {
                    asistenteId: asistente.id,
                    apto: apto,
                    coeficiente: valorCoeficiente,
                    fechaRegistro: new Date()
                });
            }

            // 5. Actualizar el asistente principal
            if (aptosExitosos.length > 0) {
                const coefActual = Number(asistente.coeficiente || 0);
                const nuevoCoefTotal = Number((coefActual + sumaCoeficienteAAgregar).toFixed(4));

                await updateDoc(doc(db, "asistentes", asistente.id), {
                    coeficiente: nuevoCoefTotal
                    // Si tienes un array de 'apartamentosRepresentados', deberías actualizarlo aquí también
                });

                alert(`✅ Se agregaron correctamente: ${aptosExitosos.join(", ")}`);
            }

            setEditando(false);
            setNuevoApto("");

        } catch (e) {
            console.error("Error al guardar apartamentos:", e);
            alert("Ocurrió un error: " + e.message);
        }
    };

    return (
        <tr>
            <td>
                {editando ? (
                    <div className="edit-box">
                        <input
                            className="input-edit"
                            type="text"
                            placeholder="101, 102..."
                            value={nuevoApto}
                            onChange={(e) => setNuevoApto(e.target.value)}
                        />
                        <button onClick={guardarCambio} className="btn-icon">✅</button>
                        <button onClick={() => { setEditando(false); setNuevoApto(""); }} className="btn-icon">❌</button>
                    </div>
                ) : (
                    <div className="apto-display">
                        <strong>{asistente.apto}</strong>
                        <button onClick={() => setEditando(true)} className="btn btn-add">
                            + Representados
                        </button>
                    </div>
                )}
            </td>
            <td>{asistente.nombre}</td>
            <td className="representados-list">
                {aptosRepresentados.length > 0
                    ? aptosRepresentados.map(a => a.apto).join(", ")
                    : <span className="muted">Sin representados</span>
                }
            </td>
            <td align="right">
                <span className="coef-text">{Number(asistente.coeficiente || 0).toFixed(2)}%</span>
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

        // 🔥 Resetear antes de escuchar
        setResultados({ si: 0, no: 0, blanco: 0 });

        const q = query(
            collection(db, "votacion"),
            where("ronda", "==", rondaActual)
        );

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
            const snapshotVotos = await getDocs(collection(db, "votacion"));
            const snapshotAsistentes = await getDocs(collection(db, "asistentes"));

            // Crear mapa apto -> nombre
            const mapaAsistentes = {};
            snapshotAsistentes.forEach(docSnap => {
                const data = docSnap.data();
                mapaAsistentes[String(data.apto)] = data.nombre;
            });

            const votos = [];
            const rondasSet = new Set();

            snapshotVotos.forEach(docSnap => {
                const v = docSnap.data();
                rondasSet.add(v.ronda);
                votos.push(v);
            });

            const rondas = Array.from(rondasSet).sort((a, b) => a - b);

            const mapa = {};

            votos.forEach(v => {
                const apto = String(v.apto);

                const nombre = mapaAsistentes[apto] || "Sin nombre";

                const key = `${nombre}-${apto}`;

                if (!mapa[key]) {
                    mapa[key] = {
                        nombre,
                        apto,
                        coeficiente: v.coeficiente,
                        respuestas: {}
                    };
                }

                mapa[key].respuestas[v.ronda] = v.opcion;
            });

            let filas = [];

            const encabezado = [
                "Nombre",
                "Apto",
                "Coeficiente",
                ...rondas.map(r => `Ronda ${r}`)
            ];

            filas.push(encabezado);

            Object.values(mapa).forEach(registro => {
                const fila = [
                    registro.nombre,
                    registro.apto,
                    registro.coeficiente,
                    ...rondas.map(r => registro.respuestas[r] || "")
                ];

                filas.push(fila);
            });

            const contenido = "\uFEFF" + filas.map(f => f.join(";")).join("\n");

            const blob = new Blob([contenido], {
                type: "text/csv;charset=utf-8;"
            });

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


    // Comienzo del Script

    const simularVotacionMasiva = async (rondaId) => {
        console.log(`🗳️ Iniciando simulación de votos para la ronda: ${rondaId}...`);

        try {
            // 1. Obtener todos los asistentes registrados
            const asistentesSnap = await getDocs(collection(db, "asistentes"));
            const asistentes = asistentesSnap.docs.map(doc => ({
                apto: doc.data().apto,
                coeficiente: doc.data().coeficiente
            }));

            if (asistentes.length === 0) {
                alert("No hay asistentes registrados para votar.");
                return;
            }

            // 2. Obtener quienes ya votaron en esta ronda para no duplicar
            const votosQuery = query(collection(db, "votacion"), where("ronda", "==", Number(rondaId)));
            const votosSnap = await getDocs(votosQuery);
            const aptosQueYaVotaron = votosSnap.docs.map(doc => doc.data().apto);

            const opciones = ["si", "no"];
            let votosRealizados = 0;

            // 3. Registrar voto para cada asistente que no haya votado aún
            for (const asistente of asistentes) {
                if (!aptosQueYaVotaron.includes(asistente.apto)) {

                    // Elegir opción aleatoria
                    const opcionAleatoria = opciones[Math.floor(Math.random() * opciones.length)];

                    await addDoc(collection(db, "votacion"), {
                        apto: asistente.apto,
                        coeficiente: asistente.coeficiente,
                        opcion: opcionAleatoria,
                        ronda: Number(rondaId),
                        fecha: new Date()
                    });

                    votosRealizados++;
                    console.log(`✅ Voto registrado: Apto ${asistente.apto} -> ${opcionAleatoria}`);
                }
            }

            alert(`Simulación terminada: ${votosRealizados} nuevos votos registrados para la ronda ${rondaId}.`);
        } catch (error) {
            console.error("Error en la simulación:", error);
            alert("Error al simular votos: " + error.message);
        }
    };


    // Fin del Script


    return (
        <div className="admin-container">
            <h1 className="admin-title">Panel de Administración</h1>

            <div className="quorum-section">
                <div className="quorum-card">
                    <h3>Coeficiente Presente</h3>
                    <div className="quorum-value">{totalCoeficiente.toFixed(2)}%</div>
                </div>
            </div>

            <h3>👥 Registro de Asistentes ({asistentes.length})</h3>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Apto Principal</th>
                            <th>Nombre del Asistente</th>
                            <th>Apartamentos Representados</th>
                            <th style={{ textAlign: 'right' }}>Coeficiente Ponderado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asistentes.map((a) => (
                            <FilaAsistente
                                key={a.id}
                                asistente={a}
                                todosLosAsistentes={asistentes}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={exportarCSV} className="btn btn-export">
                📥 Descargar Acta de Resultados (CSV)
            </button>

            {/* Boton del Script */}

            <button onClick={() => simularVotacionMasiva(rondaActual)} className="btn-admin" style={{ color: "black" }}>
                🗳️ Simular Votos Ronda Actual
            </button>

            {/* Boton del Script */}


        </div>
    );
}

export default AdminPanel
