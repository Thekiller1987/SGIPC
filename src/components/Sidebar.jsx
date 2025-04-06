import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Sidebar.css";

// Importa tus íconos y logo
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

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isGastosActive = location.pathname.toLowerCase().includes("gastos");

  return (
    <>
      {/* Botón de hamburguesa */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-item">
            <img src={checkIcon} alt="Check" className="sidebar-icon" />
          </div>
          <div className="sidebar-item">
            <img src={calculatorIcon} alt="Calculadora" className="sidebar-icon" />
          </div>
          <div className={`sidebar-item ${isGastosActive ? "active" : ""}`}>
            <img src={moneyIcon} alt="Dinero" className="sidebar-icon" />
          </div>
          <div className="sidebar-item">
            <img src={shoppingIcon} alt="Compras" className="sidebar-icon" />
          </div>
          <div className="sidebar-item">
            <img src={gmailIcon} alt="Gmail" className="sidebar-icon" />
          </div>
          <div className="sidebar-item">
            <img src={estadisticaIcon} alt="Estadística" className="sidebar-icon" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
