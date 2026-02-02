import GeneradorQR from "../components/GeneradorQR"
import { Link } from "react-router-dom"

function AdminQR() {
    return (
        <div style={{ padding: "20px" }}>

            <Link to="/admin">
                <button>⬅ Volver al panel</button>
            </Link>


            <h1>Panel de QRs de la Asamblea</h1>

            <GeneradorQR preguntaId="asistencia" />

            <hr />

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => (
                <GeneradorQR key={id} preguntaId={id} />
            ))}
        </div>
    )
}

export default AdminQR

