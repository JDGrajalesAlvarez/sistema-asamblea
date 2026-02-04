import { Link } from "react-router-dom";

function AdminPanel({ asistentes, totalCoeficiente, votosPorRonda, rondaActual }) {
    const puedeIniciar = totalCoeficiente >= 50;
    const puedeEspecial = totalCoeficiente >= 70;

    return (
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
            <h1>Panel de Administración</h1>
            <h3>📊 Estado del Quórum</h3>
            <p>Coeficiente total: <b>{totalCoeficiente.toFixed(4)}%</b></p>
            <p>{puedeIniciar ? "✅ Quórum para Sesionar" : "❌ Quórum Insuficiente"}</p>
            <p>{puedeEspecial ? "🗳️ Quórum para Decisiones Especiales (70%)" : "🚫 No alcanza para decisiones especiales"}</p>

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
