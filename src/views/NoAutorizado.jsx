import React from "react";
import Sidebar from "../components/Sidebar";
import { AlertCircle } from "lucide-react";
import "./NoAutorizado.css"; // Asegúrate de crear este archivo CSS

const NoAutorizado = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="contenido-principal no-autorizado">
        <div className="no-autorizado-card">
          <AlertCircle className="icono-alerta" size={64} />
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    </div>
  );
};

export default NoAutorizado;
