import { useEffect, useState } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function HistorialRondas() {
    const [resumenRondas, setResumenRondas] = useState({});
    const [textosPreguntas, setTextosPreguntas] = useState({});

    useEffect(() => {
        const cargarTextos = async () => {
            const querySnapshot = await getDocs(collection(db, "preguntas"));
            const textos = {};
            querySnapshot.forEach((doc) => {
                textos[doc.id] = doc.data().texto;
            });
            setTextosPreguntas(textos);
        };
        cargarTextos();

        const unsub = onSnapshot(collection(db, "votacion"), (snapshot) => {
            const acumulado = {};
            snapshot.forEach(doc => {
                const v = doc.data();
                const r = v.ronda;
                if (!acumulado[r]) {
                    acumulado[r] = { si: 0, no: 0, blanco: 0, total: 0 };
                }
                const opcion = v.opcion?.toLowerCase();
                if (acumulado[r][opcion] !== undefined) {
                    acumulado[r][opcion] += v.coeficiente;
                }
                acumulado[r].total += v.coeficiente;
            });
            setResumenRondas(acumulado);
        });

        return () => unsub();
    }, []);

    return (
        <div style={{ marginTop: 20 }}>
            <h3>📊 Historial de Decisiones</h3>
            {Object.entries(resumenRondas).sort((a, b) => b[0] - a[0]).map(([ronda, datos]) => (
                <div key={ronda} style={styles.card}>
                    <h4>Pregunta {ronda}: {textosPreguntas[ronda] || "Cargando..."}</h4>
                    <p>✅ Sí: <b>{((datos.si / datos.total) * 100 || 0).toFixed(2)}%</b> ({datos.si.toFixed(4)})</p>
                    <p>❌ No: <b>{((datos.no / datos.total) * 100 || 0).toFixed(2)}%</b> ({datos.no.toFixed(4)})</p>
                    <div style={styles.barraTotal}>
                        Total Coeficiente Votante: {datos.total.toFixed(4)}
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    card: { border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "8px", background: "#f9f9f9" },
    barraTotal: { marginTop: "10px", fontWeight: "bold", color: "#2c3e50", borderTop: "1px solid #ddd", paddingTop: "5px" }
};

export default HistorialRondas;