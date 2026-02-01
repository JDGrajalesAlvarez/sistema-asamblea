import { useParams } from "react-router-dom"
import { useState } from "react"

function PaginaVotacion({ onVotar, votos, totalCoeficiente }) {
    const { id } = useParams()
    const [apto, setApto] = useState("")

    const votar = (opcion) => {
        onVotar(id, apto, opcion)
        setApto("")
    }

    const resultados = votos[id] || { si: 0, no: 0, abstencion: 0 }
    const total = resultados.si + resultados.no + resultados.abstencion

    const porcentaje = (v) => total > 0 ? ((v / total) * 100).toFixed(1) : 0

    if (totalCoeficiente < 70) {
        return <h2>No hay quórum suficiente para votar (70% requerido)</h2>
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Votación Pregunta {id}</h2>
            <p>¿Aprueba esta propuesta?</p>

            <input
                type="number"
                placeholder="Número de apartamento"
                value={apto}
                onChange={e => setApto(e.target.value)}
            />

            <div>
                <button onClick={() => votar("si")}>✅ Sí</button>
                <button onClick={() => votar("no")}>❌ No</button>
                <button onClick={() => votar("abstencion")}>⚪ Abstención</button>
            </div>

            <hr />

            <h3>Resultados en vivo</h3>
            <p>✅ Sí: {porcentaje(resultados.si)}%</p>
            <p>❌ No: {porcentaje(resultados.no)}%</p>
            <p>⚪ Abstención: {porcentaje(resultados.abstencion)}%</p>
        </div>
    )
}

export default PaginaVotacion
