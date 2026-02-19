import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, getDocs } from "firebase/firestore";
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
            const listaNuevos = nuevoApto.split(",").map(a => a.trim()).filter(a => a !== "");
            let sumaCoeficienteAAgregar = 0;
            let aptosExitosos = [];

            for (let apto of listaNuevos) {
                const yaEsPrincipal = todosLosAsistentes.find(asist => String(asist.apto) === String(apto));
                if (yaEsPrincipal) {
                    alert(`⚠️ El apto ${apto} ya está registrado como asistente principal.`);
                    continue;
                }
                const qValidar = query(collection(db, "asistente_apartamentos"), where("apto", "==", apto));
                const querySnapshot = await getDocs(qValidar);
                if (!querySnapshot.empty) {
                    alert(`⚠️ El apto ${apto} ya está siendo representado por otro usuario.`);
                    continue;
                }
                const dataCoef = apartamentos[apto];
                if (!dataCoef) {
                    alert(`⚠️ El apto ${apto} no existe.`);
                    continue;
                }
                const valorCoeficiente = Number(dataCoef.coeficiente) || 0;
                sumaCoeficienteAAgregar += valorCoeficiente;
                aptosExitosos.push(apto);
                await addDoc(collection(db, "asistente_apartamentos"), {
                    asistenteId: asistente.id,
                    apto: apto,
                    coeficiente: valorCoeficiente,
                    fechaRegistro: new Date()
                });
            }

            if (aptosExitosos.length > 0) {
                const coefActual = Number(asistente.coeficiente || 0);
                const nuevoCoefTotal = Number((coefActual + sumaCoeficienteAAgregar).toFixed(4));
                await updateDoc(doc(db, "asistentes", asistente.id), { coeficiente: nuevoCoefTotal });
                alert(`✅ Se agregaron: ${aptosExitosos.join(", ")}`);
            }
            setEditando(false);
            setNuevoApto("");
        } catch (e) { alert("Error: " + e.message); }
    };

    return (
        <tr>
            <td>
                {editando ? (
                    <div className="edit-box">
                        <input className="input-edit" type="text" value={nuevoApto} onChange={(e) => setNuevoApto(e.target.value)} />
                        <button onClick={guardarCambio} className="btn-icon">✅</button>
                        <button onClick={() => setEditando(false)} className="btn-icon">❌</button>
                    </div>
                ) : (
                    <div className="apto-display">
                        <strong>{asistente.apto}</strong>
                        <button onClick={() => setEditando(true)} className="btn btn-add">+ Representados</button>
                    </div>
                )}
            </td>
            <td>{asistente.nombre}</td>
            <td className="representados-list">
                {aptosRepresentados.length > 0 ? aptosRepresentados.map(a => a.apto).join(", ") : "Sin representados"}
            </td>
            <td align="right">{Number(asistente.coeficiente || 0).toFixed(2)}%</td>
        </tr>
    );
}

function AdminPanel({ asistentes, totalCoeficiente, rondaActual }) {
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
            const [snapshotVotos, snapshotRepresentados] = await Promise.all([
                getDocs(collection(db, "votacion")),
                getDocs(collection(db, "asistente_apartamentos"))
            ]);

            const mapaRepresentados = {};
            snapshotRepresentados.forEach(docSnap => {
                const data = docSnap.data();
                const idAsis = data.asistenteId;
                if (!mapaRepresentados[idAsis]) mapaRepresentados[idAsis] = [];
                mapaRepresentados[idAsis].push(data.apto);
            });

            const rondasSet = new Set();
            const mapaVotosPorApto = {};
            snapshotVotos.forEach(docSnap => {
                const v = docSnap.data();
                rondasSet.add(v.ronda);
                if (!mapaVotosPorApto[String(v.apto)]) {
                    mapaVotosPorApto[String(v.apto)] = {};
                }
                mapaVotosPorApto[String(v.apto)][v.ronda] = v.opcion;
            });

            const rondas = Array.from(rondasSet).sort((a, b) => a - b);

            let filas = [];
            const encabezado = [
                "Nombre",
                "Apto Principal",
                "Representados",
                "T.Coeficiente",
                ...rondas.map(r => `Ronda ${r}`)
            ];
            filas.push(encabezado.join(";"));

            asistentes.forEach(asist => {
                const idDocumento = asist.id;
                const nroApto = String(asist.apto);

                const listaRepresentados = mapaRepresentados[idDocumento]
                    ? mapaRepresentados[idDocumento].join(" - ")
                    : "";

                const susVotos = mapaVotosPorApto[nroApto] || {};

                const fila = [
                    asist.nombre,
                    nroApto,
                    `"${listaRepresentados}"`,
                    asist.coeficiente,
                    ...rondas.map(r => susVotos[r] || "-")
                ];
                filas.push(fila.join(";"));
            });

            const contenido = "\uFEFF" + filas.join("\n");
            const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "acta_asamblea.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
            alert("Error al exportar CSV");
        }
    };


    // Comienzo del Script de Votacion boton de comienzo script en la pagina de adminpanel

    // const simularVotacionMasiva = async (rondaId) => {
    //     console.log(`🗳️ Iniciando simulación de votos para la ronda: ${rondaId}...`);

    //     try {
    //         // 1. Obtener todos los asistentes registrados
    //         const asistentesSnap = await getDocs(collection(db, "asistentes"));
    //         const asistentes = asistentesSnap.docs.map(doc => ({
    //             apto: doc.data().apto,
    //             coeficiente: doc.data().coeficiente
    //         }));

    //         if (asistentes.length === 0) {
    //             alert("No hay asistentes registrados para votar.");
    //             return;
    //         }

    //         // 2. Obtener quienes ya votaron en esta ronda para no duplicar
    //         const votosQuery = query(collection(db, "votacion"), where("ronda", "==", Number(rondaId)));
    //         const votosSnap = await getDocs(votosQuery);
    //         const aptosQueYaVotaron = votosSnap.docs.map(doc => doc.data().apto);

    //         const opciones = ["si", "no"];
    //         let votosRealizados = 0;

    //         // 3. Registrar voto para cada asistente que no haya votado aún
    //         for (const asistente of asistentes) {
    //             if (!aptosQueYaVotaron.includes(asistente.apto)) {

    //                 // Elegir opción aleatoria
    //                 const opcionAleatoria = opciones[Math.floor(Math.random() * opciones.length)];

    //                 await addDoc(collection(db, "votacion"), {
    //                     apto: asistente.apto,
    //                     coeficiente: asistente.coeficiente,
    //                     opcion: opcionAleatoria,
    //                     ronda: Number(rondaId),
    //                     fecha: new Date()
    //                 });

    //                 votosRealizados++;
    //                 console.log(`✅ Voto registrado: Apto ${asistente.apto} -> ${opcionAleatoria}`);
    //             }
    //         }

    //         alert(`Simulación terminada: ${votosRealizados} nuevos votos registrados para la ronda ${rondaId}.`);
    //     } catch (error) {
    //         console.error("Error en la simulación:", error);
    //         alert("Error al simular votos: " + error.message);
    //     }
    // };


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
                            <FilaAsistente key={a.id} asistente={a} todosLosAsistentes={asistentes} />
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={exportarCSV} className="btn btn-export">
                📥 Descargar Acta de Resultados (CSV)
            </button>

            {/* Boton del Script */}

            {/* <button onClick={() => simularVotacionMasiva(rondaActual)} className="btn-admin" style={{ color: "black" }}> 🗳️ Simular Votos Ronda Actual </button> */}

            {/* Boton del Script */}


        </div>
    );
}

export default AdminPanel;

