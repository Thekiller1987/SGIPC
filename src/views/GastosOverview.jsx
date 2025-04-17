import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { getGastos } from "../services/gastosService";
import Sidebar from "../components/Sidebar";
import "../GastosCss/GastosOverview.css";
import { useProject } from "../context/ProjectContext";
import arrowIcon from "../assets/iconos/flecha.png";

const GastosOverview = () => {
  const navigate = useNavigate();

  // Se espera recibir projectId y projectName en el state
  const { project } = useProject();
  const projectId = project?.id;
  const projectName = project?.nombre;

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
    // Al navegar al detalle, pasamos también projectName para poder volver con él
    navigate("/gasto-detail", { state: { gasto, projectId, projectName } });
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

      {/* Título en el fondo oscuro */}
      <h1 className="titulo-fondo-oscuro">Gastos</h1>

      <div className="gastos-container">
        <div className="gastos-card">
          {/* Título del proyecto */}
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
                {/* Columna 1: Muestra "Ingreso" si el registro es de tipo ingreso */}
                <div className="gasto-nombre">
                  {g.tipo === "ingreso" ? "Ingreso" : g.categoria}
                </div>
                {/* Columna 2: Fecha */}
                <div className="gasto-fecha">{g.fecha || "Sin fecha"}</div>
                {/* Columna 3: Flecha */}
                <div className="gasto-arrow">
                  <img
                    src={arrowIcon}
                    alt="Flecha"
                    className="flecha-derecha"
                  />
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
