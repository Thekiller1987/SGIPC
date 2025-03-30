// src/views/GastosOverview.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { getGastos } from "../services/gastosService";
import Sidebar from "../components/Sidebar";
import "../GastosCss/GastosOverview.css";

import arrowIcon from "../assets/iconos/flecha.png";

const GastosOverview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtenemos projectId y projectName del state
  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName;

  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        try {
          const data = await getGastos(projectId);
          setGastos(data);
        } catch (error) {
          console.error("Error al obtener gastos:", error);
        }
      }
    };
    fetchData();
  }, [projectId]);

  const handleSelectGasto = (gasto) => {
    navigate("/gasto-detail", { state: { gasto, projectId,   projectName } });
  };

  if (!projectId) {
    return (
      <div className="layout-gastos">
        <Sidebar />
        <div className="gastos-container">
          <h3>Error: No se recibió projectId</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-gastos">
      <Sidebar />
   
      <h1 className="titulo-fondo-oscuro">Gastos</h1>
      <div className="gastos-container">
        <div className="gastos-card">
          {/* Muestra el nombre del proyecto (o fallback) */}
          <h2 className="titulo-proyecto">
            {projectName ? projectName : "Proyecto sin nombre"}
          </h2>

          <ListGroup className="lista-gastos">
            {gastos.map((g) => (
              <ListGroup.Item
                key={g.id}
                className="gasto-item"
                onClick={() => handleSelectGasto(g)}
              >
                {/* Nombre / Categoría del gasto (col 1) */}
                <div className="gasto-nombre">{g.categoria}</div>
                {/* Fecha (col 2, centrada) */}
                <div className="gasto-fecha">{g.fecha || "Sin fecha"}</div>
                {/* Flecha (col 3, a la derecha) */}
                <div className="gasto-arrow">
                  <img src={arrowIcon} alt="Flecha" className="flecha-derecha" />
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
    </div>
  );
};

export default GastosOverview;
