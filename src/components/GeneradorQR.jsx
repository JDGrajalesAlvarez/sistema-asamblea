import { QRCodeCanvas } from "qrcode.react"

function GeneradorQR({ preguntaId }) {
    const baseURL = window.location.origin

    const url =
        preguntaId === "asistencia"
            ? `${baseURL}/`
            : `${baseURL}/votacion/${preguntaId}`

    return (
        <div style={{ textAlign: "center", margin: "20px" }}>
            <h3>
                {preguntaId === "asistencia"
                    ? "QR Registro de Asistencia"
                    : `QR Votación Pregunta ${preguntaId}`}
            </h3>

            <QRCodeCanvas value={url} size={220} />
            <p>{url}</p>
        </div>
    )
}

export default GeneradorQR
