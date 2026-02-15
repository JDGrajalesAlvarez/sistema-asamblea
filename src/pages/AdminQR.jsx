import GeneradorQR from "../components/GeneradorQr"
import { Link } from "react-router-dom"

function AdminQR() {

    return (
        <div style={{
            padding: "20px",
            maxWidth: "600px",
            margin: "auto",
            textAlign: "center"
        }}>
            <h1>📋 QR Registro de Asistencia</h1>

            <p>
                Escanee este código para registrar nombre y apartamento.
            </p>

            <div style={{
                marginTop: "30px",
                padding: "30px",
                border: "2px solid #4CAF50",
                borderRadius: "12px",
                background: "#f4fff6"
            }}>
                <GeneradorQR url="http://192.168.20.5:5173/registro" />
            </div>

        </div>
    )
}

export default AdminQR

