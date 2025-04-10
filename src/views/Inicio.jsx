import React from "react";
import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();

  const handleGoToProjects = () => {
    navigate("/projects");
  };

  return (
    <div className="inicio-container">
      <div className="inicio-card">
        <h1 className="inicio-titulo">Bienvenido a ObraTitan</h1>
        <p className="inicio-texto">
          Gestiona tus proyectos de construcción de forma integral. Accede rápidamente a tus proyectos, revisa el progreso y administra documentos de manera sencilla.
        </p>
        <button className="inicio-boton" onClick={handleGoToProjects}>
          Ir a Gestión de Proyectos
        </button>
      </div>
    </div>
  );
};

export default Inicio;
