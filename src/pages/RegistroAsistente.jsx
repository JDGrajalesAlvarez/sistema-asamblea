import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Registro.css"

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
        <div className="contenedor">
            <div className="card">
                <h2>Registro de Asistencia</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        className="input"
                    />

                    <input
                        type="number"
                        placeholder="Número de apartamento"
                        value={apto}
                        onChange={e => setApto(e.target.value)}
                        required
                        className="input"
                    />

                    <button type="submit" className="button">
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );


}

export default RegistroAsistente
