import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useAuth } from "../database/authcontext";
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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { project } = useProject();
  const { userData } = useAuth(); // Se obtiene el usuario con rol desde AuthContext

  const rol = userData?.rol;

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
      <button className={`sidebar-toggle ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
        {isOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className={`sidebar-logo ${isOpen ? "logo-abajo" : "logo-arriba"}`} onClick={() => goTo("/inicio")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
        </div>

        <div className="sidebar-nav">
          {/* Acceso común */}
          {(rol === "administrador" || rol === "ingeniero" || rol === "lector") && (
            <div className="sidebar-item" onClick={() => goTo("/actividades")}>
              <img src={checkIcon} alt="Tareas" className="sidebar-icon icon-check" />
            </div>
          )}

          {(rol === "administrador" || rol === "ingeniero") && (
            <div className="sidebar-item" onClick={() => goTo("/presupuesto")}>
              <img src={calculatorIcon} alt="Calculadora" className="sidebar-icon icon-calc" />
            </div>
          )}

          {(rol === "administrador") && (
            <div className="sidebar-item" onClick={() => goTo("/budget-visualization")}>
              <img src={moneyIcon} alt="Budget" className="sidebar-icon icon-money" />
            </div>
          )}

          {(rol === "administrador" || rol === "contador") && (
            <div className="sidebar-item" onClick={() => goTo("/listar-pagos")}>
              <img src={shoppingIcon} alt="Pagos" className="sidebar-icon icon-shop" />
            </div>
          )}

          {rol === "administrador" && (
            <>
              <div className="sidebar-item" onClick={() => goTo("/proveedores")}>
                <img src={gmailIcon} alt="Proveedores" className="sidebar-icon icon-mail" />
              </div>

              <div className="sidebar-item" onClick={() => goTo("/gestion-usuarios")}>
                <img src={sesion} alt="Usuarios" className="sidebar-icon icon-sesion" />
              </div>
            </>
          )}

          {/* En construcción */}
          <div className="sidebar-item" onClick={() => alert("Sección en construcción")}>
            <img src={estadisticaIcon} alt="Estadísticas" className="sidebar-icon icon-stats" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
