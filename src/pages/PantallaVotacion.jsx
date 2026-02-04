import { Navigate } from "react-router-dom";

function PantallaVotacion({ onVotar, aptoSesion }) {
    return (
        <div>
            <h2>Votación en curso</h2>
            <p>¿Está de acuerdo?</p>

            <button onClick={() => onVotar(aptoSesion, "si")}>✅ Sí</button>
            <button onClick={() => onVotar(aptoSesion, "no")}>❌ No</button>
            <button onClick={() => onVotar(aptoSesion, "blanco")}>⚪ Tal vez / En blanco</button>
        </div>
    )
}

export default PantallaVotacion
