import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

// Iconos
import logo from "../assets/iconos/Logo.png";
import calculatorIcon from "../assets/iconos/calculator.png";
import checkIcon from "../assets/iconos/Chek.png";
import estadisticaIcon from "../assets/iconos/estadistica.png";
import gmailIcon from "../assets/iconos/gmail.png";
import moneyIcon from "../assets/iconos/money.png";
import shoppingIcon from "../assets/iconos/shopping.png";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state || {};

  const toggleSidebar = () => setIsOpen(!isOpen);

  const goTo = (ruta) => {
    if (project) {
      navigate(ruta, { state: { project } });
    } else {
      alert("No hay proyecto seleccionado.");
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
        </div>

        <div className="sidebar-nav">
          {/* Tareas */}
          <div className="sidebar-item" onClick={() => goTo("/actividades")}>
            <img src={checkIcon} alt="Tareas" className="sidebar-icon" />
          </div>

          {/* Calculadora */}
          <div className="sidebar-item" onClick={() => goTo("/presupuesto")}>
            <img src={calculatorIcon} alt="Calculadora" className="sidebar-icon" />
          </div>

          {/* Budget (antes estaba en gasto) */}
          <div className="sidebar-item" onClick={() => goTo("/budget-visualization")}>
            <img src={moneyIcon} alt="Budget" className="sidebar-icon" />
          </div>

          {/* Pagos */}
          <div className="sidebar-item" onClick={() => goTo("/listar-pagos")}>
            <img src={shoppingIcon} alt="Pagos" className="sidebar-icon" />
          </div>

          {/* Proveedores */}
          <div className="sidebar-item" onClick={() => goTo("/proveedores")}>
            <img src={gmailIcon} alt="Proveedores" className="sidebar-icon" />
          </div>

          {/* Estadísticas (sin ruta por ahora) */}
          <div className="sidebar-item" onClick={() => alert("Sección en construcción")}>
            <img src={estadisticaIcon} alt="Estadísticas" className="sidebar-icon" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
