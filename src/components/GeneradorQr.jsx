import { QRCode } from "react-qr-code"

function GeneradorQR({ url }) {
    return (
        <div>
            <QRCode value={url} size={256} />
            <p style={{ marginTop: "15px", fontSize: "14px" }}>
                {url}
            </p>
        </div>
    )
}

export default GeneradorQR
