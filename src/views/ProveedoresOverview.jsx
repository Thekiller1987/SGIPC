import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerProveedores } from "../services/firebaseProveedores";
import Sidebar from "../components/Sidebar";
import "../Proveedorcss/ProveedorOverview.css";
import flecha from "../assets/iconos/flecha.png";
import { ListGroup } from "react-bootstrap";

const ProveedoresOverview = () => {
  const [proveedores, setProveedores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerProveedores();
        setProveedores(data);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelectProveedor = (proveedor) => {
    navigate("/detalle-proveedor", { state: { proveedor } });
  };

  return (
    <div className="layout-proveedores">
      <Sidebar />
      <h1 className="titulo-fondo-oscuro">Proveedores</h1>

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
