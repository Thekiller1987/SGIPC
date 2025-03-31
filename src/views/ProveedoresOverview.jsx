import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerProveedores } from "../services/firebaseProveedores";
import Sidebar from "../components/Sidebar";
import "../Proveedorcss/ProveedorOverview.css";
import flecha from "../assets/iconos/flecha.png";
import { ListGroup, Button } from "react-bootstrap";

const ProveedoresOverview = () => {
  const [proveedores, setProveedores] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { project } = location.state || {};
  const projectId = project?.id || localStorage.getItem("projectId");

  useEffect(() => {
    if (project?.id) {
      localStorage.setItem("projectId", project.id); // guardar si viene por navegación
    }

    const fetchData = async () => {
      try {
        const data = await obtenerProveedores(projectId);
        setProveedores(data);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };

    if (projectId) fetchData();
  }, [project, projectId]);

  const handleSelectProveedor = (proveedor) => {
    navigate("/detalle-proveedor", { state: { proveedor } });
  };

  const handleAgregarProveedor = () => {
    navigate("/agregar-proveedor", { state: { projectId } });
  };

  return (
    <div className="layout-proveedores">
      <Sidebar />
      <h1 className="titulo-fondo-oscuro">Proveedores</h1>

      <div className="d-flex justify-content-end me-4 mb-3">
        <Button variant="success" onClick={handleAgregarProveedor}>
          + Agregar Proveedor
        </Button>
      </div>

      <div className="proveedores-container">
        <div className="proveedores-card">
          <ListGroup className="lista-proveedores">
            {proveedores.map((prov) => (
              <ListGroup.Item
                key={prov.id}
                className="proveedor-item"
                onClick={() => handleSelectProveedor(prov)}
              >
                <div className="proveedor-nombre">{prov.empresa}</div>
                <div className="proveedor-estado">
                  {prov.historialPago?.estado || "Sin estado"}
                </div>
                <div className="proveedor-arrow">
                  <img src={flecha} alt="Flecha" className="flecha-derecha" />
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
    </div>
  );
};

export default ProveedoresOverview;
