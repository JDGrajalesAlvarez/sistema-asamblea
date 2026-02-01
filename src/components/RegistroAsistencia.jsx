import { useState } from "react"

function RegistroAsistencia({ onRegistrar }) {
    const [nombre, setNombre] = useState("")
    const [apto, setApto] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        onRegistrar(nombre, apto)
        setNombre("")
        setApto("")
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
