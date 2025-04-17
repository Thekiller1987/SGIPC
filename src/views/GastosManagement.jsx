// src/views/GastosManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import GastosForm from "../components/Gastos/GastosForm";
import "../GastosCss/GastosForm.css";
import { useProject } from "../context/ProjectContext"; // Importa el contexto

const GastosManagement = () => {
  const { project } = useProject(); // Usá el contexto
  const navigate = useNavigate();

  const [refresh, setRefresh] = useState(false);
  const handleGastoCreated = () => setRefresh(!refresh);
  const handleVerGastos = () =>
    navigate("/gastos-overview", { state: { projectId: project?.id, projectName: project?.nombre } });

  useEffect(() => {
    document.body.style.background = "#2f2f2f";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  if (!project) {
    return (
      <div className="layout-formulario-gasto">
        <Sidebar />
        <div className="gastos-container">
          <h2>Error: No hay proyecto seleccionado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-formulario-gasto">
      <Sidebar />
      <div className="contenido-gastos">
        <h1 className="titulo-fondo-oscurito">Agregar Gasto / Ingreso</h1>
  
        <div className="gastos-formulario-wrapper">
          {/* ✅ Nombre del proyecto ahora DENTRO del card blanco */}
          <h2 className="nombre-proyecto-gasto">{project.nombre}</h2>
  
          <div className="btn-ver-gastos-container">
            <button className="btn-ver-gastos" onClick={handleVerGastos}>
              Ver Gastos
            </button>
          </div>
  
          <GastosForm projectId={project.id} onGastoCreated={handleGastoCreated} />
        </div>
      </div>
    </div>
  );
  
};

export default GastosManagement;
