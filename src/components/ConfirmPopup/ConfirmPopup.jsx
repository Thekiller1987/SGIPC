import React from "react";
import "./ConfirmPopup.css";

const ConfirmPopup = ({ mensaje, onConfirmar, onCancelar }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-contenido">
        <p>{mensaje}</p>
        <div className="popup-botones">
          <button className="btn-confirmar" onClick={onConfirmar}>Sí, eliminar</button>
          <button className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
