import "../styles/CardsPreguntas.css"
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function CardsPreguntas({ numero, texto, onVotar, aptoSesion, rondaActual }) {

    const [yaVoto, setYaVoto] = useState(false);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {

        const verificarVoto = async () => {
            if (!aptoSesion || !rondaActual) return;

            const votoId = `${aptoSesion}_${rondaActual}`;
            const votoRef = doc(db, "votacion", votoId);

            const snap = await getDoc(votoRef);

            if (snap.exists()) {
                setYaVoto(true);
            } else {
                setYaVoto(false);
            }

            setCargando(false);
        };

        verificarVoto();

    }, [aptoSesion, rondaActual]);

    if (cargando) {
        return <p>Verificando estado de voto...</p>;
    }
    return (
        <div className="card-Pregunta">
            <h3>Pregunta {numero}</h3>
            <p>{texto}</p>

            <div className="botones-container">
                <button disabled={yaVoto} onClick={async () => { const exito = await onVotar(aptoSesion, "si"); if (exito) setYaVoto(true); }}>Sí</button>
                <button disabled={yaVoto} onClick={async () => { const exito = await onVotar(aptoSesion, "no"); if (exito) setYaVoto(true); }}>No</button>
            </div>
            {yaVoto && <p style={{ color: "green" }}>✅ Ya votaste </p>}
        </div>
    );
}

export default CardsPreguntas