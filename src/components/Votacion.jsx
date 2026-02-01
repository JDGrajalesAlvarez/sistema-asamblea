import { useState } from "react"

function Votacion({ onVotar, totalCoeficiente }) {
    const [apto, setApto] = useState("")

    const votar = (opcion) => {
        if (!apto) {
            alert("Ingresa tu número de apartamento")
            return
        }

        onVotar(apto, opcion)
        setApto("")
    }

    return (
        <div style={{ marginTop: "30px" }}>
            <h2>Votación - Pregunta 1</h2>
            <p>¿Aprueba el punto tratado?</p>

            <input
                type="number"
                placeholder="Número de apartamento"
                value={apto}
                onChange={e => setApto(e.target.value)}
            />

            <div style={{ marginTop: "10px" }}>
                <button onClick={() => votar("si")}>✅ Sí</button>
                <button onClick={() => votar("no")}>❌ No</button>
                <button onClick={() => votar("abstencion")}>⚪ Abstención</button>
            </div>
        </div>
    )
}

export default Votacion
