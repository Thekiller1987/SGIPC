// src/views/GastosListView.jsx
import React from "react";
import { Container, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import GastosList from "../components/Gastos/GastosList";

const GastosListView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId;

  const handleBack = () => {
    navigate("/gastos", { state: { projectId } });
  };

  return (
    <Container className="mt-5 pt-5">
      <h2>Listado de Gastos / Ingresos</h2>
      <GastosList projectId={projectId} />
      <div className="mt-4">
        <Button variant="secondary" onClick={handleBack}>
          Volver
        </Button>
      </div>
    </Container>
  );
};

export default GastosListView;
