import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useAuth } from "../database/authcontext"; // ✅ agregado
import "./Sidebar.css";

import { Menu, X } from "lucide-react";

import logo from "../assets/iconos/Logo.png";
import calculatorIcon from "../assets/iconos/calculator.png";
import checkIcon from "../assets/iconos/Chek.png";
import estadisticaIcon from "../assets/iconos/estadistica.png";
import gmailIcon from "../assets/iconos/gmail.png";
import moneyIcon from "../assets/iconos/money.png";
import shoppingIcon from "../assets/iconos/shopping.png";
import sesion from "../assets/iconos/sesion.png";
import Documento from "../assets/iconos/documento.png";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { project } = useProject();
  const { logout } = useAuth(); // ✅ agregado

  const toggleSidebar = () => setIsOpen(!isOpen);

  const goTo = (ruta) => {
    if (project) {
      navigate(ruta, { state: { project } });
    } else {
      alert("No hay proyecto seleccionado.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();           // ✅ cierra sesión
      localStorage.clear();     // ✅ limpia localStorage
      window.location.replace("/"); // ✅ recarga evitando navegación hacia atrás
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <X size={28} color="white" />
        ) : (
          <Menu size={28} color="white" />
        )}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div
          className={`sidebar-logo ${isOpen ? "logo-abajo" : "logo-arriba"}`}
          onClick={() => goTo("/inicio")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
        </div>

        <div className="sidebar-nav">
          <div
            className="sidebar-item"
            data-tooltip="Actividades"
            onClick={() => goTo("/actividades")}
          >
            <img
              src={checkIcon}
              alt="Tareas"
              className="sidebar-icon icon-check"
            />
          </div>
          <div
            className="sidebar-item"
            data-tooltip="Calculadora"
            onClick={() => goTo("/presupuesto")}
          >
            <img
              src={calculatorIcon}
              alt="Calculadora"
              className="sidebar-icon icon-calc"
            />
          </div>
          <div
            className="sidebar-item"
            data-tooltip="Presupuesto"
            onClick={() => goTo("/budget-visualization")}
          >
            <img
              src={moneyIcon}
              alt="Budget"
              className="sidebar-icon icon-money"
            />
          </div>
          <div
            className="sidebar-item"
            data-tooltip="Caja"
            onClick={() => goTo("/listar-pagos")}
          >
            <img
              src={shoppingIcon}
              alt="Pagos"
              className="sidebar-icon icon-shop"
            />
          </div>
          <div
            className="sidebar-item"
            data-tooltip="Proveedores"
            onClick={() => goTo("/proveedores")}
          >
            <img
              src={gmailIcon}
              alt="Proveedores"
              className="sidebar-icon icon-mail"
            />
          </div>
          <div
            className="sidebar-item"
            data-tooltip="Estadistica"
            onClick={() => goTo("/kpi-dashboard")}
          >
            <img
              src={estadisticaIcon}
              alt="Estadísticas"
              className="sidebar-icon icon-stats"
            />
          </div>

          <div
            className="sidebar-item"
            data-tooltip="Archivos"
            onClick={() => goTo("/listar-archivos")}
          >
            <img
              src={Documento}
              alt="Archivos"
              className="sidebar-icon icon-sesion"
            />
          </div>

          <div
            className="sidebar-item"
            data-tooltip="Usuarios"
            onClick={() => goTo("/gestion-usuarios")}
          >
            <img
              src={sesion}
              alt="Usuarios"
              className="sidebar-icon icon-sesion"
            />
          </div>

          <div
            className="sidebar-item"
            data-tooltip="Cerrar sesión"
            onClick={handleLogout}
          >
            <img
              src={sesion}
              alt="Cerrar sesión"
              className="sidebar-icon icon-sesion"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
  