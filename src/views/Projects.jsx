import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectForm from "../components/ProyectoFuncionalidad/ProjectForm";
import ProjectsList from "../components/ProyectoFuncionalidad/ProjectsList";

const Projects = () => {
  const [refresh, setRefresh] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Estado para detectar si estamos offline

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false); // Cambia el estado a online
    };
    const handleOffline = () => {
      setIsOffline(true); // Cambia el estado a offline
    };
    
    // Detecta cambios en el estado de la conexión
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Verifica si estamos offline al cargar
    setIsOffline(!navigator.onLine);
    
    // Limpieza de los event listeners cuando el componente se desmonte
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
          <ProjectsList key={refresh} isOffline={isOffline} /> {/* Pasa el estado offline a la lista */}
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;
