import React from "react";
import ProjectForm from "../components/ProyectoFuncionalidad/ProjectForm";
import "../ProveedoresCss/CrearProyecto.css"; 

const CreateProjectView = () => {
  return (
    <div className="layout-proyectos">
    
      <div className="crear-proyecto-container">
        <ProjectForm />
      </div>
    </div>
  );
};

export default CreateProjectView;
