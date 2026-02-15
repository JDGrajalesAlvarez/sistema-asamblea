import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate } from "react-router-dom"
import imagenDeCarga from "../assets/imagenDeCarga.gif"

function PantallaCarga() {

    const [totalCoeficiente, setTotalCoeficiente] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {

        const unsub = onSnapshot(
            collection(db, "asistentes"),
            (snapshot) => {

                const lista = snapshot.docs.map(doc => doc.data())

                const suma = lista.reduce(
                    (acc, a) => acc + (Number(a.coeficiente) || 0),
                    0
                )

                setTotalCoeficiente(suma)

                if (suma >= 50) {
                    navigate("/votacion")
                }
            }
        )

        return () => unsub()

    }, [navigate])

    return (

        <div className="patallaDeCarga">

            <img
                src={imagenDeCarga}
                alt="Pantalla de Carga"
                style={{ width: "500px" }}
            />

            <h2>Esperando quórum...</h2>

            <p>Coeficiente actual:</p>
            <h1>{totalCoeficiente.toFixed(2)}%</h1>

            <p>Se necesita 50% para iniciar la votación.</p>
        </div>
    )
}

export default PantallaCarga
