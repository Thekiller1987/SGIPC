import React from "react";
import { useNavigate } from "react-router-dom";
import "../Iniciocss/Inicio.css";
import Lottie from "lottie-react";
import GruaAnimacion from "../assets/iconos/animaciongrua.json";

const Inicio = () => {
  const navigate = useNavigate();

  const handleGoToProjects = () => {
    navigate("/proyecto");
  };

  return (
    <div className="inicio-container">
      <div className="inicio-contenido-vertical">
        <div className="inicio-animacion">
          <Lottie animationData={GruaAnimacion} loop={true} />
        </div>

        <h1 className="inicio-titulo">Bienvenido a ObraTitan</h1>

        <p className="inicio-descripcion">
          Gestiona tus proyectos de construcción de forma integral.<br />
          Accede rápidamente a tus proyectos, revisa el progreso y administra documentos.
       </p>
        <button className="btn-principal" onClick={handleGoToProjects}>
          Ir a Gestión de Proyectos
        </button>
      </div>
    </div>
  );
};

//// no funciona culpa puchichu

export default Inicio;
