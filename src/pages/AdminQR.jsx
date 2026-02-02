import GeneradorQR from "../components/GeneradorQR"

function AdminQR() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>Panel de QRs de la Asamblea</h1>

            <GeneradorQR preguntaId="asistencia" />

            <hr />

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => (
                <GeneradorQR key={id} preguntaId={id} />
            ))}
            <Link to="/admin">
                <button>⬅ Volver al panel</button>
            </Link>

        </div>
    )
}

export default AdminQR
