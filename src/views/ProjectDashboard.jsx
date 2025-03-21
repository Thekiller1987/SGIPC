import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;

  return (
    <Container className="mt-5 pt-5">
      <h1>{project ? project.nombre : "Proyecto"}</h1>
      <p>Aquí se mostrará el menú del proyecto.</p>

      {/* Verificamos que el proyecto tenga un ID antes de pasar a actividades */}
      {project?.id ? (
        <Button
          variant="primary"
          onClick={() => navigate("/actividades", { state: { projectId: project.id } })}
        >
          Ver Actividades
        </Button>
      ) : (
        <p>Error: No se encontró el ID del proyecto.</p>
      )}
    </Container>
  );
};

export default ProjectDashboard;
