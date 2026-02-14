// import "../styles/CardsPreguntas"

function CardsPreguntas({ numero, texto, onVotar, aptoSesion }) {
    return (
        <div className="card-Pregunta">
            <h3>Pregunta {numero}</h3>
            <p>{texto}</p>
            <div className="botones-container">
                <button onClick={() => onVotar(aptoSesion, "si")}>Sí</button>
                <button onClick={() => onVotar(aptoSesion, "no")}>No</button>
            </div>
        </div>
    );
}

export default CardsPreguntas