function PanelControl({ totalPersonas, totalCoeficiente }) {
    const puedeIniciarReunion = totalCoeficiente >= 50
    const puedeVotarTemasEspeciales = totalCoeficiente >= 70

    return (
        <div style={{ marginTop: "20px" }}>
            <h2>Panel de Control</h2>

            <p>👥 Personas presentes: {totalPersonas}</p>
            <p>🏢 Coeficiente acumulado: {totalCoeficiente.toFixed(2)}%</p>

            <hr />

            <p>
                {puedeIniciarReunion
                    ? "✅ Hay quórum para INICIAR la reunión (50%+)"
                    : "❌ Aún NO hay quórum para iniciar la reunión"}
            </p>

            <p>
                {puedeVotarTemasEspeciales
                    ? "🗳️ Se pueden votar temas especiales (presupuesto, decisiones importantes) — 70%+"
                    : "🚫 Aún NO se pueden votar temas especiales (requiere 70%)"}
            </p>
        </div>
    )
}

export default PanelControl
