import { useEffect, useState } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {} from "../styles/historialRondas.css" 

function HistorialRondas() {
    const [resumenRondas, setResumenRondas] = useState({});
    const [textosPreguntas, setTextosPreguntas] = useState({});

    useEffect(() => {

        const unsub = onSnapshot(collection(db, "votacion"), (snapshot) => {
            const acumulado = {};
            snapshot.forEach(doc => {
                const v = doc.data();
                const r = v.ronda;
                if (!acumulado[r]) {
                    acumulado[r] = { si: 0, no: 0, blanco: 0, totalCoeficiente: 0, conteo: 0 };
                }
                
                const opcion = v.opcion?.toLowerCase();
                if (acumulado[r][opcion] !== undefined) {
                    acumulado[r][opcion] += v.coeficiente;
                }
                
                acumulado[r].totalCoeficiente += v.coeficiente;
                
                acumulado[r].conteo += 1; 
            });
            setResumenRondas(acumulado);
        });

        return () => unsub();
    }, []);

    return (
        <div className="historial-container">
            <h3 className="section-title">📊 Historial de Decisiones</h3>
            <div className="historial-grid">
                {Object.entries(resumenRondas)
                    .sort((a, b) => Number(b[0]) - Number(a[0])) 
                    .map(([ronda, datos]) => {
                        const porcSi = ((datos.si / datos.totalCoeficiente) * 100) || 0;
                        const porcNo = ((datos.no / datos.totalCoeficiente) * 100) || 0;
                        const porcBlanco = ((datos.blanco / datos.totalCoeficiente) * 100) || 0;

                        return (
                            <div key={ronda} className="ronda-card">
                                <div className="ronda-header">
                                    <span className="ronda-numero">Ronda #{ronda}</span>
                                    <h4>{textosPreguntas[ronda] || `Pregunta ${ronda}`}</h4>
                                </div>

                                <div className="ronda-body">
                                    <div className="resultado-fila">
                                        <div className="label-data">
                                            <span>✅ A Favor</span>
                                            <span>{porcSi.toFixed(2)}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-fill fill-si" style={{ width: `${porcSi}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="resultado-fila">
                                        <div className="label-data">
                                            <span>❌ En Contra</span>
                                            <span>{porcNo.toFixed(2)}%</span>
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
                                    <div className="coeficiente-text" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Coeficiente total: {datos.totalCoeficiente.toFixed(3)}%
                                    </div>
                                    {porcBlanco > 0 && (
                                        <div className="blanco-text">
                                            Abstención/Blanco: {porcBlanco.toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

export default HistorialRondas;