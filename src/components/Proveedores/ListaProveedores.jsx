import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { obtenerProveedores } from "../../services/firebaseProveedores";
import flecha from "../../assets/iconos/flecha.png";
import "../../Proveedorcss/Proveedor.css";

const ListaProveedores = ({ onAgregar, onSeleccionar }) => {
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const datos = await obtenerProveedores();
      setProveedores(datos);
    };

    fetchData();
  }, []);

  return (
    <div className="layout-proveedores">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="proveedores-container">
        <h1 className="titulo-fondo-oscuro">Proveedores</h1>

        <div className="proveedores-card">

          <div className="lista-proveedores">
            {proveedores.map((prov) => (
              <div
                key={prov.id}
                className="proveedor-item"
                onClick={() => onSeleccionar(prov)}
              >
                <div className="proveedor-nombre">{prov.empresa}</div>
                <div className="proveedor-estado">{prov.historialPago?.estado || "Sin estado"}</div>
                <div className="proveedor-arrow">
                  <img src={flecha} alt="ver más" className="flecha-derecha" />
                </div>
              </div>
            ))}
          </div>

          <div className="botones-formulario mt-4">
            <button className="btn-agregar" onClick={onAgregar}>
              Añadir Proveedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaProveedores;
