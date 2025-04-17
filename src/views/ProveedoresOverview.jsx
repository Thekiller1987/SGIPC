import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerProveedores } from "../services/firebaseProveedores";
import Sidebar from "../components/Sidebar";
import "../Proveedorcss/ProveedorOverview.css";
import flecha from "../assets/iconos/flecha.png";

const ProveedoresOverview = () => {
  const [proveedores, setProveedores] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { project } = location.state || {};
  const projectId = project?.id || localStorage.getItem("projectId");

  useEffect(() => {
    if (project?.id) {
      localStorage.setItem("projectId", project.id);
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

      <div className="proveedores-container">
        <div className="proveedores-card">
          <div className="lista-proveedores">
            {proveedores.map((prov) => (
              <div
                key={prov.id}
                className="proveedor-item"
                onClick={() => handleSelectProveedor(prov)}
              >
                <div className="proveedor-nombre">{prov.empresa}</div>
                <div className="proveedor-arrow">
                  <img src={flecha} alt="Flecha" className="flecha-derecha" />
                </div>
              </div>
            ))}
          </div>
          <div className="contenedor-boton-agregar">
            <button className="btn-agregar-proveedor" onClick={handleAgregarProveedor}>
              + Agregar Proveedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedoresOverview;