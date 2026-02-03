import { useEffect, useState } from "react"

function PantallaVotacion() {
    const [apto, setApto] = useState(null)

    useEffect(() => {
        const aptoGuardado = localStorage.getItem("apto")
        if (aptoGuardado) {
            setApto(aptoGuardado)
        }
    }, [])

    if (!apto) {
        return <h2>No tienes sesión activa. Escanea el QR de registro.</h2>
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
