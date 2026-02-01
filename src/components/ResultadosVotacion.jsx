function ResultadosVotacion({ votos, totalCoeficiente }) {
    const totalVotado = votos.si + votos.no + votos.abstencion

    const porcentaje = (valor) =>
        totalVotado > 0 ? ((valor / totalVotado) * 100).toFixed(1) : 0

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Resultados en vivo</h3>
            <p>✅ Sí: {porcentaje(votos.si)}%</p>
            <p>❌ No: {porcentaje(votos.no)}%</p>
            <p>⚪ Abstención: {porcentaje(votos.abstencion)}%</p>
        </div>
    )
}

export default ResultadosVotacion
