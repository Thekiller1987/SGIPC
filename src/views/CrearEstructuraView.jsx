import React from "react";
import Sidebar from "../components/Sidebar";
import EstructuraForm from "../components/Estructuras/EstructuraForm";

const CrearEstructuraView = () => {
  return (
    <div className="layout-presupuesto">
      <Sidebar />
      <div className="contenido-presupuesto">
        <h1 className="titulo">Crear Estructura</h1>
        <EstructuraForm />
      </div>
    </div>
  );
};

export default CrearEstructuraView;
