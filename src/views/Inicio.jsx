// src/views/Inicio.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();

  const handleGoToProjects = () => {
    navigate("/projects"); // Asegúrate de tener configurada esta ruta en tu Router
  };

  return (
    <Container className="mt-5 pt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Bienvenido a ObraTitan</Card.Title>
              <Card.Text>
                Gestiona tus proyectos de construcción de forma integral. Accede rápidamente a tus proyectos, revisa el progreso y administra documentos de manera sencilla.
              </Card.Text>
              <Button variant="primary" onClick={handleGoToProjects}>
                Ir a Gestión de Proyectos
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Inicio;
