import { useState } from "react"
import { useNavigate } from "react-router-dom"

function RegistroAsistente({ onRegistrar }) {
    const [nombre, setNombre] = useState("")
    const [apto, setApto] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!nombre || !apto) {
            alert("Por favor completa todos los campos")
            return
        }

        const exito = await onRegistrar(nombre, apto)

        if (exito) {
            navigate("/PantallaCarga")
        }
    }

    return (
        <div style={{
            maxWidth: "400px",
            margin: "auto",
            marginTop: "60px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px"
        }}>
            <h2 style={{ textAlign: "center" }}>
                📋 Registro de Asistencia
            </h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <input
                    type="number"
                    placeholder="Número de apartamento"
                    value={apto}
                    onChange={e => setApto(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "15px" }}
                />

                <button
                    type="submit"
                >
                    Registrar
                </button>
            </form>
        </div>
    )
}

export default RegistroAsistente
