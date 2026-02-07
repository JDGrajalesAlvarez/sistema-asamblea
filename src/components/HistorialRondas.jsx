import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "/src/firebase.js";

function HistorialRondas() {
    const [resumenRondas, setResumenRondas] = useState({})

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "votos"), (snapshot) => {
            const acumulado = {}

            snapshot.forEach(doc => {
                const v = doc.data()
                const r = v.ronda

                if (!acumulado[r]) {
                    acumulado[r] = { si: 0, no: 0, blanco: 0, total: 0 }
                }

                acumulado[r][v.opcion] += v.coeficiente
                acumulado[r].total += v.coeficiente
            })

            setResumenRondas(acumulado)
        })

        return () => unsub()
    }, [])

    return (
        <div style={{ marginTop: 20 }}>
            <h3>📊 Historial de Rondas</h3>

            {Object.entries(resumenRondas).map(([ronda, datos]) => (
                <div key={ronda} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                    <h4>Ronda {ronda}</h4>
                    <p>✅ Sí: {datos.si.toFixed(2)}%</p>
                    <p>❌ No: {datos.no.toFixed(2)}%</p>
                    <p>⚪ Blanco: {datos.blanco.toFixed(2)}%</p>
                    <p><b>Total votado: {datos.total.toFixed(2)}%</b></p>
                </div>
            ))}
        </div>
    )
}

export default HistorialRondas
