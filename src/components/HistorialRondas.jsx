import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/historialRondas.css";

function HistorialRondas({ rondaActual }) {
    const [resumenRondas, setResumenRondas] = useState({});
    const [textosPreguntas, setTextosPreguntas] = useState({}); // Nota: Deberías cargar esto de Firebase también
    const COEFICIENTE_TOTAL_CONJUNTO = 100;

    useEffect(() => {
        // Escuchar cambios en la colección de votación en tiempo real
        const unsub = onSnapshot(collection(db, "votacion"), (snapshot) => {
            const acumulado = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const { ronda, opcion, coeficiente } = data;

                if (!ronda) return;

                // Inicializar la ronda si no existe en el acumulado
                if (!acumulado[ronda]) {
                    acumulado[ronda] = { si: 0, no: 0, blanco: 0, totalCoeficiente: 0, conteo: 0 };
                }

                const opcionNormalizada = opcion?.toLowerCase();

                // Sumar votos según la opción
                if (acumulado[ronda][opcionNormalizada] !== undefined) {
                    acumulado[ronda][opcionNormalizada] += coeficiente;
                }

                acumulado[ronda].totalCoeficiente += coeficiente;
                acumulado[ronda].conteo += 1;
            });

            setResumenRondas(acumulado);
        });

        return () => unsub();
    }, []);

    // Filtrar y ordenar las rondas finalizadas (anteriores a la actual)
    const rondasFiltradas = Object.entries(resumenRondas)
        .filter(([ronda]) => Number(ronda) === Number(rondaActual)) // <-- Filtro de igualdad estricta
        .sort((a, b) => Number(b[0]) - Number(a[0]));

    return (
        <div className="historial-container">
            {/* Cambiamos el título para que sea dinámico */}
            <h3 className="section-title">📊 Respuestas Actuales</h3>

            <div className="historial-grid">
                {rondasFiltradas.length > 0 ? (
                    rondasFiltradas.map(([ronda, datos]) => {
                        // Cálculos de porcentajes
                        const calcularPorcentaje = (valor) =>
                            COEFICIENTE_TOTAL_CONJUNTO ? (valor / COEFICIENTE_TOTAL_CONJUNTO) * 100 : 0;

                        const porcSi = calcularPorcentaje(datos.si);
                        const porcNo = calcularPorcentaje(datos.no);
                        const porcBlanco = calcularPorcentaje(datos.blanco);

                        return (
                            <div key={ronda} className="ronda-card">
                                <div className="ronda-header">
                                    <h4>{textosPreguntas[ronda] || `Pregunta ${ronda}`}</h4>
                                </div>

                                <div className="ronda-body">
                                    {/* Barra A Favor */}
                                    <div className="resultado-fila">
                                        <div className="label-data">
                                            <span>✅ A Favor</span>
                                            <span>{porcSi.toFixed(1)}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-fill fill-si" style={{ width: `${porcSi}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Barra En Contra */}
                                    <div className="resultado-fila">
                                        <div className="label-data">
                                            <span>❌ En Contra</span>
                                            <span>{porcNo.toFixed(1)}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-fill fill-no" style={{ width: `${porcNo}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ronda-footer">
                                    <div className="participacion-text">
                                        Apartamentos que votaron: <strong>{datos.conteo}</strong>
                                    </div>
                                    <div className="coeficiente-info">
                                        <p>Coeficiente total: {datos.totalCoeficiente.toFixed(1)}%</p>
                                        {porcBlanco > 0 && (
                                            <p className="blanco-text">Abstención/Blanco: {porcBlanco.toFixed(1)}%</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="no-data">No hay rondas finalizadas para mostrar.</p>
                )}
            </div>
        </div>
    );
}

export default HistorialRondas;