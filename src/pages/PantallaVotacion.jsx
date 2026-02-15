import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import CardsPreguntas from "../components/CardsPreguntas";
import { db } from "../firebase";

function PantallaVotacion({ onVotar, aptoSesion }) {
    const [preguntaActiva, setPreguntaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [votacionAbierta, setVotacionAbierta] = useState(false);

    useEffect(() => {
        const unsubConfig = onSnapshot(doc(db, "configuracion", "estadoVotacion"), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const rondaActual = data.rondaActual;
                setVotacionAbierta(data.votacionActiva);

                if (rondaActual) {
                    const preguntaRef = doc(db, "preguntas", String(rondaActual));
                    const preguntaSnap = await getDoc(preguntaRef);

                    if (preguntaSnap.exists()) {
                        setPreguntaActiva({
                            id: rondaActual,
                            ...preguntaSnap.data()
                        });
                    }
                }
            }
            setLoading(false);
        });

        return () => unsubConfig();
    }, []);

    if (loading) return <p>Cargando pregunta...</p>;

    return (
        <div className="container" style={{ textAlign: "center", marginTop: "20px" }}>
            <h2>🗳️ Panel de Votación</h2>
            <p>Apartamento: <strong>{aptoSesion}</strong></p>
            <hr />

            {!votacionAbierta ? (
                <div style={styles.mensajeCerrado}>
                    <h3>La votación se encuentra cerrada</h3>
                    <p>Por favor, espere a que el administrador inicie la siguiente pregunta.</p>
                </div>
            ) : preguntaActiva ? (
                <CardsPreguntas
                    key={preguntaActiva.id}
                    numero={preguntaActiva.ronda}
                    texto={preguntaActiva.texto}
                    onVotar={onVotar}
                    aptoSesion={aptoSesion}
                />
            ) : (
                <p>No hay una pregunta configurada para esta ronda.</p>
            )}
        </div>
    );
}

const styles = {
    mensajeCerrado: {
        padding: "40px",
        backgroundColor: "#fff3cd",
        color: "#856404",
        borderRadius: "10px",
        border: "1px solid #ffeeba",
        marginTop: "20px"
    }
};

export default PantallaVotacion;