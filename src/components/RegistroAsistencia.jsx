import { useState } from "react"
import { useNavigate } from "react-router-dom"

function RegistroAsistencia({ onRegistrar }) {
    const [nombre, setNombre] = useState("")
    const [apto, setApto] = useState("")
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()

        const ok = await onRegistrar(nombre, apto)
        if (ok) {
            navigate("/votacion", { replace: true })
            return
        }
    }

    return (
        <div>
            <h2>Registro de Asistencia</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                />

                <input
                    type="number"
                    placeholder="Apartamento"
                    value={apto}
                    onChange={e => setApto(e.target.value)}
                    required
                />

                <button type="submit">Registrar</button>
            </form>
        </div>
    )
}

export default RegistroAsistencia
