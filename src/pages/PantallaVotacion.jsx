import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import CardsPreguntas from "../components/CardsPreguntas";
import { db } from "../firebase";
import HistorialRondas from "../components/HistorialRondas";
import "../styles/CardsPreguntas.css"

function PantallaVotacion({ onVotar, aptoSesion }) {
    const [preguntaActiva, setPreguntaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [votacionAbierta, setVotacionAbierta] = useState(false);

    // useEffect(() => {
    //     const unsubConfig = onSnapshot(
    //         doc(db, "configuracion", "estadoVotacion"),
    //         async (docSnap) => {

    //             if (docSnap.exists()) {
    //                 const data = docSnap.data();
    //                 const rondaActual = data.rondaActual;
    //                 setVotacionAbierta(data.votacionActiva);

    //                 if (rondaActual !== undefined && rondaActual !== null) {
    //                     const preguntaRef = doc(db, "preguntas", String(rondaActual));
    //                     const preguntaSnap = await getDoc(preguntaRef);

    //                     if (preguntaSnap.exists()) {
    //                         setPreguntaActiva({
    //                             id: rondaActual,
    //                             ...preguntaSnap.data()
    //                         });
    //                     } else {
    //                         setPreguntaActiva(null);
    //                     }
    //                 }
    //             }
    //             setLoading(false);
    //         });

    //     return () => unsubConfig();
    // }, []);


    useEffect(() => {
        const unsubConfig = onSnapshot(
            doc(db, "configuracion", "estadoVotacion"),
            async (docSnap) => {

                if (!docSnap.exists()) {
                    setPreguntaActiva(null);
                    setVotacionAbierta(false);
                    setLoading(false);
                    return;
                }

                const data = docSnap.data();
                const rondaActual = data.rondaActual;

                setVotacionAbierta(Boolean(data.votacionActiva));

                if (!rondaActual) {
                    setPreguntaActiva(null);
                    setLoading(false);
                    return;
                }

                const preguntaRef = doc(db, "preguntas", String(rondaActual));
                const preguntaSnap = await getDoc(preguntaRef);

                if (preguntaSnap.exists()) {
                    setPreguntaActiva({
                        id: rondaActual,
                        ...preguntaSnap.data()
                    });
                } else {
                    setPreguntaActiva(null);
                }

                setLoading(false);
            }
        );

        return () => unsubConfig();
    }, []);

    if (loading) return <p>Cargando pregunta...</p>;

    return (
        <div className="container" style={{ textAlign: "center", marginTop: "20px" }}>
            <h2 className="title-votacion">Panel de Votación</h2>
            <p className="apt-votacion">Apartamento: <strong>{aptoSesion}</strong></p>
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
                    rondaActual={preguntaActiva.ronda}
                />
            ) : (
                <p>No hay una pregunta configurada para esta ronda.</p>
            )}

            <HistorialRondas rondaActual={preguntaActiva?.id} />
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