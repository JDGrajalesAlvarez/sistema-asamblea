import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "/src/firebase.js"

function AdminPanel({ asistentes, totalCoeficiente, rondaActual }) {
    const puedeIniciar = totalCoeficiente >= 50;
    const puedeEspecial = totalCoeficiente >= 70;
    const [resultados, setResultados] = useState({ si: 0, no: 0, blanco: 0 });

    useEffect(() => {
        if (!rondaActual) return; // 🔥 protección importante

        const q = query(
            collection(db, "votos"),
            where("ronda", "==", rondaActual)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            let si = 0, no = 0, blanco = 0;

            snapshot.forEach(doc => {
                const v = doc.data();
                const coef = Number(v.coeficiente) || 0;

                if (v.opcion === "si") si += coef;
                if (v.opcion === "no") no += coef;
                if (v.opcion === "blanco") blanco += coef;
            });

            setResultados({ si, no, blanco });
        });

        return () => unsub();
    }, [rondaActual]);

    return (
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
            <h1>Panel de Administración</h1>
            <h3>📊 Estado del Quórum</h3>
            <p>Coeficiente total: <b>{totalCoeficiente.toFixed(2)}%</b></p>
            <p>{puedeIniciar ? "✅ Quórum para Sesionar" : "❌ Quórum Insuficiente"}</p>
            <p>{puedeEspecial ? "🗳️ Quórum para Decisiones Especiales (70%)" : "🚫 No alcanza para decisiones especiales"}</p>

            <hr />
            <h3>Resultados Ronda {rondaActual}</h3>
            <p>Sí: {resultados.si.toFixed(4)}%</p>
            <p>No: {resultados.no.toFixed(4)}%</p>
            <p>colocar aqui el total de votos por apartamento</p>

            <hr />
            <h3>👥 Asistentes ({asistentes.length})</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f4f4f4" }}>
                            <th>Apto</th>
                            <th>Nombre</th>
                            <th>Coef %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asistentes.map((a, i) => (
                            <tr key={i}>
                                <td align="center">{a.apto}</td>
                                <td>{a.nombre}</td>
                                <td align="right">{a.coeficiente}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPanel
