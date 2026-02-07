import { db } from "/src/firebase.js";
import { doc, setDoc } from "firebase/firestore"
import HistorialRondas from "../components/HistorialRondas"



function PanelAdminVotacion({ rondaActual, votacionActiva }) {

    const abrirVotacion = async () => {
        await setDoc(doc(db, "configuracion", "estadoVotacion"), {
            votacionActiva: true
        }, { merge: true })
    }

    const cerrarVotacion = async () => {
        await setDoc(doc(db, "configuracion", "estadoVotacion"), {
            votacionActiva: false
        }, { merge: true })
    }

    const nuevaRonda = async () => {
        await setDoc(doc(db, "configuracion", "estadoVotacion"), {
            rondaActual: rondaActual + 1,
            votacionActiva: true
        }, { merge: true })
    }


    return (
        <div style={{ marginTop: 20, border: "1px solid #ccc", padding: "15px", borderRadius: "8px", background: "#f9f9f9" }}>
            <h2>🎛 Control de Votación - Ronda {rondaActual}</h2>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <button onClick={abrirVotacion} style={{ background: "green", color: "white" }}>🟢 Abrir</button>
                <button onClick={cerrarVotacion} style={{ background: "red", color: "white" }}>🔴 Cerrar</button>
                <button onClick={() => {
                    if (window.confirm("¿Deseas iniciar una nueva ronda?")) {
                        nuevaRonda();
                    }
                }}>➕ Nueva Ronda</button>
            </div>

            <p>Estado actual: <b>{votacionActiva ? "🟢 Abierta" : "🔴 Cerrada"}</b></p>
            <HistorialRondas />

        </div>
    );
}

export default PanelAdminVotacion;
