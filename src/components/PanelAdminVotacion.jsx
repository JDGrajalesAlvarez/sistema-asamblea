import { Link } from "react-router-dom";

function PanelAdminVotacion({ rondaActual, setRondaActual, votacionActiva, setVotacionActiva, votosPorRonda }) {
    const resultados = votosPorRonda[rondaActual] || { si: 0, no: 0, blanco: 0 };
    const totalRonda = resultados.si + resultados.no + resultados.blanco;
    const calcularPct = (valor) => totalRonda > 0 ? ((valor / totalRonda) * 100).toFixed(2) : "0.00";

    return (
        <div style={{ marginTop: 20, border: "1px solid #ccc", padding: "15px", borderRadius: "8px", background: "#f9f9f9" }}>
            <h2>Control de Votación - Ronda {rondaActual}</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button onClick={() => setVotacionActiva(true)} style={{ background: "green", color: "white" }}>🟢 Abrir</button>
                <button onClick={() => setVotacionActiva(false)} style={{ background: "red", color: "white" }}>🔴 Cerrar</button>
                <button onClick={() => {
                    if (window.confirm("¿Deseas iniciar una nueva ronda?")) {
                        setRondaActual(prev => prev + 1);
                        setVotacionActiva(true);
                    }
                }}>➕ Nueva Ronda</button>
            </div>

            <div style={{ background: "white", padding: "10px", borderRadius: "5px" }}>
                <p>Estado: <b>{votacionActiva ? "Abierta" : "Cerrada"}</b></p>
                <p>✅ Sí: {resultados.si.toFixed(4)} ({calcularPct(resultados.si)}%)</p>
                <p>❌ No: {resultados.no.toFixed(4)} ({calcularPct(resultados.no)}%)</p>
                <p>⚪ Blanco: {resultados.blanco.toFixed(4)} ({calcularPct(resultados.blanco)}%)</p>
                <p><b>Total Coeficiente Votante: {totalRonda.toFixed(4)}%</b></p>
            </div>
        </div>
    );
}

export default PanelAdminVotacion