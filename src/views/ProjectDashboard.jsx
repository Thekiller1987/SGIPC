// src/views/ProjectDashboard.jsx
import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;

  return (
    <Container className="mt-5 pt-5">
      <h1>{project ? project.nombre : "Proyecto"}</h1>
      <p>Aquí se mostrará el menú del proyecto.</p>

      {project?.id ? (
        <>
          <Button
            variant="primary"
            onClick={() =>
              navigate("/actividades", { state: { projectId: project.id } })
            }
            className="me-2 mb-2"
          >
            Ver Actividades
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              navigate("/budget-visualization", { state: { project } })
            }
            className="me-2 mb-2"
          >
            Ver Presupuesto
          </Button>
        </>
      ) : (
        <p>Error: No se encontró el ID del proyecto.</p>
      )}
    </Container>
  );
};

export default ProjectDashboard;
