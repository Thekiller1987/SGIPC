import React from "react";
import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const ProjectDashboard = () => {
  const location = useLocation();
  // Se espera que el objeto del proyecto se pase en el state al navegar
  const project = location.state?.project;

  return (
    <Container className="mt-5 pt-5">
      <h1>{project ? project.nombre : "Proyecto"}</h1>
      <p>Aquí se mostrará el menú del proyecto (vacío por ahora).</p>
      {/* Aquí puedes agregar el menú con enlaces a Arquitectura, Finanzas, Tareas, etc. */}
    </Container>
  );
};

export default ProjectDashboard;
