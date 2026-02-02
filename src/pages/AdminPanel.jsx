import { Link } from "react-router-dom"

function AdminPanel({ asistentes, totalCoeficiente, votosPorPregunta }) {
    const puedeIniciar = totalCoeficiente >= 50
    const puedeEspecial = totalCoeficiente >= 70

    return (
        <div style={{ padding: "20px" }}>
            <h1>Panel de Administración</h1>

            <h2>📊 Estado del Quórum</h2>
            <p>Coeficiente total presente: <b>{totalCoeficiente.toFixed(2)}%</b></p>
            <p>{puedeIniciar ? "✅ Puede iniciar la reunión (50%)" : "❌ No hay quórum aún"}</p>
            <p>{puedeEspecial ? "🗳️ Puede votar temas especiales (70%)" : "🚫 Aún no se puede votar temas especiales"}</p>

            <hr />

            <h2>👥 Asistentes Registrados</h2>
            <table border="1" cellPadding="5">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apartamento</th>
                        <th>Coeficiente</th>
                    </tr>
                </thead>
                <tbody>
                    {asistentes.map((a, i) => (
                        <tr key={i}>
                            <td>{a.nombre}</td>
                            <td>{a.apto}</td>
                            <td>{a.coeficiente}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />

            <h2>🗳️ Resultados por Pregunta</h2>
            {Object.entries(votosPorPregunta).map(([id, votos]) => {
                const total = votos.si + votos.no + votos.abstencion
                const pct = v => total > 0 ? ((v / total) * 100).toFixed(1) : 0

                return (
                    <div key={id} style={{ marginBottom: "15px" }}>
                        <h3>Pregunta {id}</h3>
                        <p>✅ Sí: {pct(votos.si)}%</p>
                        <p>❌ No: {pct(votos.no)}%</p>
                        <p>⚪ Abstención: {pct(votos.abstencion)}%</p>
                        <Link to="/admin/qr">
                            <button>📱 Ver QR de votaciones</button>
                        </Link>
                    </div>

                )
            })}
        </div>
    )
}

export default AdminPanel
