import { db } from "/src/firebase.js";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import HistorialRondas from "../components/HistorialRondas";
import ModalNuevaPregunta from './ModalNuevaPrgunta';
import { useState, useEffect } from "react";

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
        <div style={styles.container}>
            <h2 style={styles.title}>⚙️ Panel de Control de Votación</h2>

            <div style={styles.adminCard}>
                <div style={styles.section}>
                    <p>Ronda actual en pantalla: <strong style={styles.rondaText}># {rondaActual}</strong></p>
                    <div style={styles.controls}>
                        <label>Seleccionar pregunta para los usuarios: </label>
                        <select 
                            value={rondaActual} 
                            onChange={(e) => cambiarRondaManualmente(e.target.value)}
                            style={styles.select}
                        >
                            {Array.from({ length: totalPreguntasExistentes }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>Pregunta {num}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={styles.buttonGroup}>
                    <button 
                        onClick={abrirVotacion} 
                        disabled={votacionActiva}
                        style={{ ...styles.btn, background: votacionActiva ? "#ccc" : "#28a745" }}
                    >
                        🟢 Abrir Votación
                    </button>
                    
                    <button 
                        onClick={cerrarVotacion} 
                        disabled={!votacionActiva}
                        style={{ ...styles.btn, background: !votacionActiva ? "#ccc" : "#dc3545" }}
                    >
                        🔴 Cerrar Votación
                    </button>

                    <button 
                        onClick={() => setMostrarModal(true)}
                        style={{ ...styles.btn, background: "#007bff" }}
                    >
                        ➕ Crear Pregunta {totalPreguntasExistentes + 1}
                    </button>
                </div>

                <p style={styles.status}>
                    Estado: <b>{votacionActiva ? "RECIBIENDO VOTOS" : "SISTEMA PAUSADO"}</b>
                </p>
            </div>

            <ModalNuevaPregunta
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                onSave={manejarGuardadoPregunta}
            />

            <hr style={styles.divider} />
            
            <HistorialRondas />
        </div>
    );
}

const styles = {
    container: { marginTop: "20px", fontFamily: "Arial, sans-serif" },
    title: { color: "#333", borderBottom: "2px solid #007bff", paddingBottom: "10px" },
    adminCard: { background: "#f8f9fa", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    section: { marginBottom: "20px" },
    rondaText: { fontSize: "1.2em", color: "#007bff" },
    controls: { marginTop: "10px" },
    select: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer" },
    buttonGroup: { display: "flex", gap: "10px", flexWrap: "wrap" },
    btn: { color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
    status: { marginTop: "15px", fontSize: "0.9em", color: "#666" },
    divider: { margin: "30px 0", border: "0", borderTop: "1px solid #eee" }
};

export default PanelAdminVotacion;