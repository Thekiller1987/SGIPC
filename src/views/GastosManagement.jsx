// src/views/GastosManagement.jsx
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import GastosForm from "../components/Gastos/GastosForm";
import GastosList from "../components/Gastos/GastosList";
import { useLocation } from "react-router-dom";

const GastosManagement = () => {
  // Obtenemos el projectId desde location.state o query param
  const location = useLocation();
  const projectId = location.state?.projectId;

  // Estado para refrescar la lista tras crear un gasto
  const [refresh, setRefresh] = useState(false);

  const handleGastoCreated = () => {
    setRefresh(!refresh);
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
          <h2>Agregar Gasto</h2>
          <GastosForm projectId={projectId} onGastoCreated={handleGastoCreated} />
        </Col>
        <Col md={6}>
          <GastosList key={refresh} projectId={projectId} />
        </Col>
      </Row>
    </Container>
  );
};

export default GastosManagement;
