import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import PresupuestoCalculator from "../components/Presupuesto/PresupuestoCalculator";
import EstructuraForm from "../components/Presupuesto/EstructuraForm";
import ListaEstructuras from "../components/Presupuesto/ListaEstructuras";
import { useLocation } from "react-router-dom";
import "../PresupuestoCss/PresupuestoCalculator.css";

const PresupuestoView = () => {
  const location = useLocation();
  const projectId = location.state?.projectId;
  const [vista, setVista] = useState("materiales");
  const [estructuraEnEdicion, setEstructuraEnEdicion] = useState(null);
  const [mostrarLista, setMostrarLista] = useState(false); // ✅ nuevo estado

  return (
    <div className="layout-presupuesto">
      <Sidebar />
      <div className="contenido-presupuesto">
        <h1 className="titulo">Calculadora de Presupuesto</h1>

        <div className="switch-vista">
          <button
            className={`switch-btn ${vista === "materiales" ? "activo" : ""}`}
            onClick={() => setVista("materiales")}
          >
            ➕ Agregar Materiales
          </button>
          <button
            className={`switch-btn ${vista === "estructura" ? "activo" : ""}`}
            onClick={() => setVista("estructura")}
          >
            🧱 Crear Estructura
          </button>

          {vista === "estructura" && (
            <button
              className={`switch-btn ${mostrarLista ? "activo" : ""}`}
              onClick={() => setMostrarLista(!mostrarLista)}
            >
              📋 Lista de Estructuras
            </button>
          )}

          {estructuraEnEdicion && (
            <button className="switch-btn editar-activo" disabled>
              ✏️ Editando: {estructuraEnEdicion.nombre}
            </button>
          )}
        </div>

        {projectId ? (
          <>
            {vista === "materiales" && (
              <div className="formulario-materiales">
                <PresupuestoCalculator projectId={projectId} />
              </div>
            )}
            {vista === "estructura" && (
              <div className="formulario-estructura">
                <EstructuraForm
                  estructuraEnEdicion={estructuraEnEdicion}
                  setEstructuraEnEdicion={setEstructuraEnEdicion}
                />
                {mostrarLista && (
                  <ListaEstructuras
                    setEstructuraEnEdicion={setEstructuraEnEdicion}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ color: "red" }}>Error: No se recibió el ID del proyecto.</p>
        )}
      </div>
    </div>
  );
};

export default PresupuestoView;
