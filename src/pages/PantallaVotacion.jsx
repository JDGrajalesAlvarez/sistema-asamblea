import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"
import CardsPreguntas from "../components/CardsPreguntas"

const PREGUNTAS_ESTATICAS = [
    "¿Aprueban los estados financieros del periodo 2025?",
    "¿Aprueban la reforma del Reglamento de la Propiedad y el manual de convivencia?",
    "¿Aprueban asegurar de aquí en adelante las áreas comunes y privadas de la copropiedad?",
    "¿Aprueban el presupuesto 2026?",
    "¿Aceptan los postulados para integrar el consejo de administración?",
    "¿Aceptan los postulados para integrar el comité de convivencia?",
    "¿Aceptan los postulados para integrar el comité de seguridad?"
];

function PantallaVotacion({ onVotar, aptoSesion }) {
    const [preguntasDinamicas, setPreguntasDinamicas] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "configuracion", "estadoVotacion"), (docSnap) => {
            if (docSnap.exists()) {
                setPreguntasDinamicas(docSnap.data().extras || []);
            }
            if (!aptoSesion) {
                return <h2>Sesión no válida</h2>
            }
        });
        return () => unsub();
    }, []);

    const todasLasPreguntas = [...PREGUNTAS_ESTATICAS, ...preguntasDinamicas];

    return (
        <div className="container">
            {todasLasPreguntas.map((texto, index) => (
                <CardsPreguntas key={index} numero={index + 1} texto={texto} onVotar={onVotar} aptoSesion={aptoSesion} />
            ))}
        </div>
    )
}

export default PantallaVotacion