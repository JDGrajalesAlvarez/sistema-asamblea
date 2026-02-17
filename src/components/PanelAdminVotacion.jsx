import { db } from "/src/firebase.js";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import HistorialRondas from "../components/HistorialRondas";
import ModalNuevaPregunta from './ModalNuevaPrgunta';
import { useState, useEffect } from "react";
import "../styles/AdminPanelVotacion.css"

function PanelAdminVotacion({ rondaActual, votacionActiva }) {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [totalPreguntasExistentes, setTotalPreguntasExistentes] = useState(0);

    useEffect(() => {
        const obtenerTotalPreguntas = async () => {
            const querySnapshot = await getDocs(collection(db, "preguntas"));
            setTotalPreguntasExistentes(querySnapshot.size);
        };
        obtenerTotalPreguntas();
    }, [rondaActual, mostrarModal]);

    const abrirVotacion = async () => {
        const ref = doc(db, "configuracion", "estadoVotacion");
        await setDoc(ref, { votacionActiva: true }, { merge: true });
    };

    const cerrarVotacion = async () => {
        const ref = doc(db, "configuracion", "estadoVotacion");
        await setDoc(ref, { votacionActiva: false }, { merge: true });
    };

    const cambiarRondaManualmente = async (nuevaRonda) => {
        const ref = doc(db, "configuracion", "estadoVotacion");
        try {
            await setDoc(ref, { rondaActual: Number(nuevaRonda) }, { merge: true });
            console.log("Cambiando a ronda:", nuevaRonda);
        } catch (error) {
            console.error("Error al cambiar ronda:", error);
        }
    };

    const manejarGuardadoPregunta = async (textoPregunta) => {
        if (!textoPregunta.trim()) return;

        const configRef = doc(db, "configuracion", "estadoVotacion");

        try {
            const snapConfig = await getDoc(configRef);
            let siguienteRonda = 1;

            if (snapConfig.exists()) {
                const querySnapshot = await getDocs(collection(db, "preguntas"));
                siguienteRonda = querySnapshot.size + 1;
            }


            await setDoc(doc(db, "preguntas", String(siguienteRonda)), {
                ronda: siguienteRonda,
                texto: textoPregunta,
                fechaCreacion: new Date(),
                activa: true
            });

            await setDoc(configRef, {
                rondaActual: siguienteRonda,
                votacionActiva: true
            }, { merge: true });

            setMostrarModal(false);
        } catch (e) {
            console.error("Error al iniciar nueva pregunta:", e);
            alert("Error al guardar: " + e.message);
        }
    };

    return (
        <div className="admin-container">
            <h2 className="admin-title">⚙️ Panel de Control Administrativo</h2>

            <div className="admin-card">
                <div className="admin-header-section">
                    <p className="ronda-info">
                        Pregunta proyectada:
                        <span className="ronda-badge">#{rondaActual}</span>
                    </p>

                    <div className="admin-controls">
                        <select
                            className="admin-select"
                            value={rondaActual}
                            onChange={(e) => cambiarRondaManualmente(e.target.value)}
                        >
                            {Array.from({ length: totalPreguntasExistentes }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>Pregunta {num}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="admin-button-group">
                    <button
                        onClick={abrirVotacion}
                        disabled={votacionActiva}
                        className="btn-admin btn-abrir"
                    >
                        🟢 Abrir Votación
                    </button>

                    <button
                        onClick={cerrarVotacion}
                        disabled={!votacionActiva}
                        className="btn-admin btn-cerrar"
                    >
                        🔴 Cerrar Votación
                    </button>

                    <button
                        onClick={() => setMostrarModal(true)}
                        className="btn-admin btn-crear"
                    >
                        ➕ Nueva Pregunta ({totalPreguntasExistentes + 1})
                    </button>
                </div>

                <div className={`status-badge ${votacionActiva ? 'status-active' : 'status-paused'}`}>
                    <span className="status-dot"></span>
                    {votacionActiva
                        ? "SISTEMA ACTIVO: RECIBIENDO VOTOS"
                        : "SISTEMA EN PAUSA: VOTACIÓN CERRADA"}
                </div>
            </div>

            <ModalNuevaPregunta
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                onSave={manejarGuardadoPregunta}
            />

            <div className="admin-container">
                <section className="resultados-vivos">
                    <HistorialRondas rondaActual={rondaActual} />
                </section>
            </div>
        </div>
    );
}

export default PanelAdminVotacion;