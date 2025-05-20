// src/components/PantallaCarga.jsx
import React from "react";
import "../components/PantallaCarga.css"; // ajusta si tu carpeta se llama diferente

const PantallaCarga = ({ mensaje = "Cargando..." }) => (
  <div className="pantalla-carga">
    <div className="wave-loader">
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </div>
    <p className="texto-cargando">{mensaje}</p>
  </div>
);

export default PantallaCarga;
