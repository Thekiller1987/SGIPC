import React from "react";
import { useNavigate } from "react-router-dom";
import "../InicioCss/Inicio.css";
import Lottie from "lottie-react";
import GruaAnimacion from "../assets/iconos/animaciongrua.json";

const Inicio = () => {
  const navigate = useNavigate();

  const handleGoToProjects = () => {
    navigate("/projects");
  };

  return (
    <div className="inicio-container">
<<<<<<< HEAD
      <div className="inicio-card">
        <h1 className="inicio-titulo">Bienvenido a ObraTitan</h1>
        <p className="inicio-texto">
          Gestiona tus proyectos de construcción de forma integral. Accede rápidamente a tus proyectos, revisa el progreso y administra documentos de manera sencilla.
        </p>
        <button className="inicio-boton" onClick={handleGoToProjects}>
=======
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
>>>>>>> 6b5a79cd92e1b27a37b51b16047350457114bc45
          Ir a Gestión de Proyectos
        </button>
      </div>
    </div>
  );
};

export default Inicio;
