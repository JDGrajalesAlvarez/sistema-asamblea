import { db } from "/src/firebase.js";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import HistorialRondas from "../components/HistorialRondas";
import ModalNuevaPregunta from './ModalNuevaPrgunta';
import { useState } from "react";


function PanelAdminVotacion({ rondaActual, votacionActiva }) {
    const [mostrarModal, setMostrarModal] = useState(false);

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
        }, { merge: true });
    };

    const iniciarNuevaPregunta = () => {
        setMostrarModal(true);
    };

    const manejarGuardadoPregunta = async (textoPregunta) => {
        if (!textoPregunta.trim()) return;

        const ref = doc(db, "configuracion", "estadoVotacion");

        try {
            await updateDoc(ref, {
                extras: arrayUnion(textoPregunta)
            });
            console.log("Se guardo en firebase", textoPregunta);
            setMostrarModal(false);
        } catch (e) {
            console.error("error al guardar", e)
        }
    };

    return (
        <div>
            <h2>Control de Votación</h2>

            <div>
                <button onClick={abrirVotacion} style={{ background: "green", color: "white" }}>Abrir</button>
                <button onClick={cerrarVotacion} style={{ background: "red", color: "white" }}>Cerrar</button>
                <button onClick={() => { iniciarNuevaPregunta() }}>Nueva Pregunta</button>

                <ModalNuevaPregunta
                    isOpen={mostrarModal}
                    onClose={() => setMostrarModal(false)}
                    onSave={manejarGuardadoPregunta}
                />
            </div>

            <p>Estado actual: <b>{votacionActiva ? "🟢 Abierta" : "🔴 Cerrada"}</b></p>

            <HistorialRondas />

        </div>
    );
}

export default PanelAdminVotacion;