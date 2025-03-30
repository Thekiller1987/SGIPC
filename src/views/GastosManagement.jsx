// src/views/GastosManagement.jsx
import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import GastosForm from "../components/Gastos/GastosForm";

const GastosManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Recibimos projectId y projectName
  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName;

  const [refresh, setRefresh] = useState(false);

  const handleGastoCreated = () => {
    setRefresh(!refresh);
  };

  const handleVerGastos = () => {
    // Pasamos projectId y projectName a GastosOverview
    navigate("/gastos-overview", {
      state: { projectId, projectName },
    });
  };

  if (!projectId) {
    return (
      <Container className="mt-5 pt-5">
        <h2>Error: No se proporcionó un projectId</h2>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5">
      <Row>
        <Col md={6}>
          <h2>Agregar Gasto / Ingreso</h2>
          <GastosForm projectId={projectId} onGastoCreated={handleGastoCreated} />
        </Col>
      </Row>
      <div className="mt-4">
        <Button variant="info" onClick={handleVerGastos}>
          Ver Gastos
        </Button>
      </div>
    </Container>
  );
};

export default GastosManagement;
