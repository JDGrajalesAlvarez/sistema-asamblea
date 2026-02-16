import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import imagenDeCarga from "../assets/imagenDeCarga.gif";
import "../styles/PantallaCarga.css";

function PantallaCarga() {

    const [totalCoeficiente, setTotalCoeficiente] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {

        const unsub = onSnapshot(
            collection(db, "asistentes"),
            (snapshot) => {

                const lista = snapshot.docs.map(doc => doc.data());

                const suma = lista.reduce(
                    (acc, a) => acc + (Number(a.coeficiente) || 0),
                    0
                );

                setTotalCoeficiente(suma);

                if (suma >= 50) {
                    navigate("/votacion");
                }
            }
        );

        return () => unsub();

    }, [navigate]);

    return (
        <div className="carga-container">
            <div className="carga-card">

                <img
                    src={imagenDeCarga}
                    alt="Cargando"
                    className="carga-img"
                />

                <h2 className="carga-titulo">
                    Esperando quórum...
                </h2>

                <div className="carga-porcentaje">
                    {totalCoeficiente}%
                </div>

                <div className="progress-bar-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${Math.min(totalCoeficiente, 100)}%` }}
                    />
                </div>

                <p>
                    Se necesita 50% para iniciar la votación.
                </p>

            </div>
        </div>
    );
}

export default PantallaCarga;
