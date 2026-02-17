import GeneradorQR from "../components/GeneradorQr"
import { Link } from "react-router-dom"
import "../styles/Qr.css"

function AdminQR() {

    const url = "https://juan-y-cristian-project-2026.vercel.app/registro";

    return (
        <div className="qr-container">
            <div className="qr-card">

                <h1 className="qr-title">
                    📋 QR Registro de Asistencia
                </h1>

                <p className="qr-description">
                    Escanee este código para registrar nombre y apartamento.
                </p>

                <div className="qr-box">
                    <GeneradorQR url={url} />
                </div>
            </div>
        </div>
    );
}

export default AdminQR

