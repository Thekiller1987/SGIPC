import React from "react";
import Sidebar from "../components/Sidebar";
import DetalleProyectoView from "./DetalleProyectoView";


const ProjectDashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="contenido-principal fondo-oscuro">
        <DetalleProyectoView />
      </div>
    </div>
  );
};

export default ProjectDashboard;
