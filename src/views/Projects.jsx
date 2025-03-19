// src/views/Projects.jsx
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectForm from "../components/ProyectoFuncionalidad/ProjectForm";
import ProjectsList from "../components/ProyectoFuncionalidad/ProjectsList";

const Projects = () => {
  const [refresh, setRefresh] = useState(false);

  const handleProjectCreated = () => {
    // Alterna el estado para forzar la actualización de la lista
    setRefresh(!refresh);
  };

  return (
    <Container className="mt-5 pt-5">
      <Row>
        <Col md={6}>
          <h2>Crear Proyecto</h2>
          <ProjectForm onProjectCreated={handleProjectCreated} />
        </Col>
        <Col md={6}>
          <ProjectsList key={refresh} />
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;
