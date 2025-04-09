import React from "react";
import Sidebar from "../components/Sidebar";
import { useProject } from "../context/ProjectContext";

const ProjectDashboard = () => {
  const { project } = useProject();

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="contenido-principal fondo-oscuro">
        <h1 className="titulo-modulo">
          {project?.nombre || "Proyecto sin nombre"}
        </h1>
        <p className="descripcion-dashboard">
          Selecciona una sección en el menú para continuar.
        </p>
      </div>
    </div>
  );
};

export default ProjectDashboard;