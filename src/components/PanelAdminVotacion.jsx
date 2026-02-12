import { db } from "/src/firebase.js";
import { doc, setDoc } from "firebase/firestore"
import HistorialRondas from "../components/HistorialRondas"
import { getDoc, updateDoc } from "firebase/firestore"


function PanelAdminVotacion({ rondaActual, votacionActiva }) {

    const abrirVotacion = async () => {
        const ref = doc(db, "configuracion", "estadoVotacion");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            await setDoc(ref, {
                rondaActual: 1,
                votacionActiva: true
            });
        } else {
            await updateDoc(ref, {
                votacionActiva: true
            });
        }
    };

    const cerrarVotacion = async () => {
        await setDoc(doc(db, "configuracion", "estadoVotacion"), {
            votacionActiva: false
        }, { merge: true })
    }

    const iniciarNuevaRonda = async () => {

        const ref = doc(db, "configuracion", "estadoVotacion");
        const snap = await getDoc(ref);

        if (!snap.exists()) return;

        const rondaActualDB = snap.data().rondaActual || 0;

        await updateDoc(ref, {
            rondaActual: rondaActualDB + 1,
            votacionActiva: true
        });
    };

    return (
        <div style={{ marginTop: 20, border: "1px solid #ccc", padding: "15px", borderRadius: "8px", background: "#f9f9f9" }}>
            <h2>🎛 Control de Votación - Ronda {rondaActual}</h2>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <button onClick={abrirVotacion} style={{ background: "green", color: "white" }}>🟢 Abrir</button>
                <button onClick={cerrarVotacion} style={{ background: "red", color: "white" }}>🔴 Cerrar</button>
                <button onClick={() => {
                    if (window.confirm("¿Deseas iniciar una nueva ronda?")) {
                        iniciarNuevaRonda();
                    }
                }}>➕ Nueva Ronda</button>
            </div>

            <p>Estado actual: <b>{votacionActiva ? "🟢 Abierta" : "🔴 Cerrada"}</b></p>
            <HistorialRondas />

        </div>
    );
}

export default PanelAdminVotacion;
