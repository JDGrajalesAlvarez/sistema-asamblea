import { Navigate } from "react-router-dom"

function PantallaVotacion() {
    const apto = localStorage.getItem("apto")

    if (!apto) {
        return <Navigate to="/" replace />
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Bienvenido a la votación</h1>
            <p>Apartamento registrado: <b>{apto}</b></p>
            <p>Espera a que el administrador active una pregunta…</p>
        </div>
    )
}

export default PantallaVotacion
