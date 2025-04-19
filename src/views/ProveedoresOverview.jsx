import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../src/assets/database/firebaseconfig"; // Asegúrate de que la ruta sea correcta
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import flecha from "../assets/iconos/flecha.png";
import iconoBuscar from "../assets/iconos/search.png";
import {  } from "../../src/services/firebaseProveedores"; // Asegúrate de que la ruta sea correcta
import "../Proveedorcss/ProveedorOverview.css";

const ProveedoresOverview = () => {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState(""); //  búsqueda
  const [isOffline, setIsOffline] = useState(!navigator.onLine); //  estado de conexión
  const navigate = useNavigate();
  const location = useLocation();

  const { project } = location.state || {};
  const projectId = project?.id || localStorage.getItem("projectId");

  //  Detección de conexión
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Escuchar datos en tiempo real de proveedores en Firestore y manejar caché offline
  useEffect(() => {
    const q = query(collection(db, "proveedores"), where("proyectoId", "==", projectId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setProveedores(data);
      if (isOffline) {
        console.log("Offline: mostrando datos desde la caché local.");
      }
    }, (error) => {
      console.error("Error al escuchar proveedores:", error);
      if (isOffline) {
        console.log("Offline: mostrando datos cacheados si están disponibles.");
      } else {
        alert("Error al cargar proveedores: " + error.message);
      }
    });

    return () => unsubscribe();
  }, [projectId, isOffline]);

  const handleSelectProveedor = (proveedor) => {
    navigate("/detalle-proveedor", { state: { proveedor } });
  };

  const handleAgregarProveedor = () => {
    navigate("/agregar-proveedor", { state: { projectId } });
  };

  // ✅ Filtro por empresa o nombre
  const proveedoresFiltrados = proveedores.filter((prov) => {
    const empresa = prov.empresa?.toLowerCase() || "";
    const nombre = prov.nombre?.toLowerCase() || "";
    return (
      empresa.includes(filtro.toLowerCase()) ||
      nombre.includes(filtro.toLowerCase())
    );
  });

  return (
    <div className="layout-proveedores">
      <Sidebar />
      <h1 className="titulo-fondo-oscuro">Proveedores</h1>

      <div className="proveedores-container">
        <div className="proveedores-card">

          {/* 🔍 Cuadro de búsqueda */}
          <div className="barra-superior-proveedores">
            <div className="input-con-icono">
              <img src={iconoBuscar} alt="Buscar" className="icono-dentro-input" />
              <input
                type="text"
                className="input-busqueda"
                placeholder="Buscar proveedor ..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="lista-proveedores">
            {proveedoresFiltrados.map((prov) => (
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
