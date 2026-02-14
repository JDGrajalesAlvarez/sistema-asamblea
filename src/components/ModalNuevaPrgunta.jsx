import React, { useState } from 'react';

const ModalNuevaPregunta = ({ isOpen, onClose, onSave }) => {
    const [input, setInput] = useState("");

    if (!isOpen) return null; // Si no está abierto, no renderiza nada

    return (
     <div className="modal">
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={() => onSave(input)}>Guardar</button>
            <button onClick={onClose}>Cancelar</button>
        </div>
    );
};

export default ModalNuevaPregunta;