import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"

function PantallaVotacion({ onVotar, aptoSesion }) {
    const [rondaActual, setRondaActual] = useState(1)
    const [votacionActiva, setVotacionActiva] = useState(false)

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "configuracion", "estadoVotacion"), (docSnap) => {
            if (docSnap.exists()) {
                setRondaActual(docSnap.data().rondaActual)
                setVotacionActiva(docSnap.data().votacionActiva)
            }
        })

        return () => unsub()
    }, [])

    return (
        <div>
            <h2>🗳️ Ronda {rondaActual}</h2>

            {!votacionActiva ? (
                <p style={{ color: "red" }}>La votación está cerrada</p>
            ) : (
                <>
                    <p>¿Está de acuerdo?</p>
                    <button onClick={() => onVotar(aptoSesion, "si")}>✅ Sí</button>
                    <button onClick={() => onVotar(aptoSesion, "no")}>❌ No</button>
                    <button onClick={() => onVotar(aptoSesion, "blanco")}>⚪ Tal vez / En blanco</button>
                </>
            )}
        </div>
    )
}

export default PantallaVotacion
