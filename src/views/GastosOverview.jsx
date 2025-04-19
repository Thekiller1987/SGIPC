import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { getGastos } from "../services/gastosService";
import Sidebar from "../components/Sidebar";
import "../GastosCss/GastosOverview.css";
import { useProject } from "../context/ProjectContext";
import arrowIcon from "../assets/iconos/flecha.png";
import iconoBuscar from "../assets/iconos/search.png"; // ✅ Ícono de búsqueda

const GastosOverview = () => {
  const navigate = useNavigate();
  const { project } = useProject();
  const projectId = project?.id;
  const projectName = project?.nombre;

  const [gastos, setGastos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [offline, setOffline] = useState(false); // ✅ Estado de conexión

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        const data = await getGastos(projectId);
        setGastos(data);
        setOffline(false);
      } catch (error) {
        console.error("Error al obtener gastos:", error);
        if (!navigator.onLine) {
          setOffline(true);
        }
      }
    };

    fetchData();
  }, [projectId]);

  const handleSelectGasto = (gasto) => {
    navigate("/gasto-detail", { state: { gasto, projectId, projectName } });
  };

  const gastosFiltrados = gastos.filter((g) => {
    const categoria = g.categoria?.toLowerCase() || "";
    const tipo = g.tipo?.toLowerCase() || "";
    return (
      categoria.includes(filtro.toLowerCase()) ||
      tipo.includes(filtro.toLowerCase())
    );
  });

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
          <h2 className="titulo-proyecto">
            {projectName ? projectName : "Proyecto sin nombre"}
          </h2>

          {/* ✅ Mensaje de modo offline */}
          {offline && (
            <div style={{ color: "orange", marginBottom: "10px" }}>
              ⚠ Estás sin conexión. Mostrando datos almacenados en caché.
            </div>
          )}

          {/* ✅ Barra de búsqueda */}
          <div className="barra-superior-proveedores">
            <div className="input-con-icono">
              <img src={iconoBuscar} alt="Buscar" className="icono-dentro-input" />
              <input
                type="text"
                className="input-busqueda"
                placeholder="Buscar por categoría o tipo..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <ListGroup className="lista-gastos">
            {gastosFiltrados.map((g) => (
              <ListGroup.Item
                key={g.id}
                className="gasto-item"
                onClick={() => handleSelectGasto(g)}
              >
                <div className="gasto-nombre">
                  {g.tipo === "ingreso" ? "Ingreso" : g.categoria}
                </div>
                <div className="gasto-fecha">{g.fecha || "Sin fecha"}</div>
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
