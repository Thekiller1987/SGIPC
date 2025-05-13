import React from "react";
import KPI2Presupuesto from "./KPI2Presupuesto";
import KPI3EstadoCaja from "./KPI3EstadoCaja";
import KPI4PagosMensuales from "./KPI4PagosMensuales";
import Sidebar from "../Sidebar";
import "../../EstadisticasCss/KPIDashboard.css";

const KPIDashboard = () => {
  return (
    <>
      <Sidebar />

      <div className="kpi-dashboard-container">
        <h2>Dashboard de KPIs - Obra Titan</h2>

        <p>
          Este panel presenta un análisis visual de los indicadores clave del sistema Obra Titan.
          Se visualizan métricas relacionadas con el presupuesto, liquidez y pagos,
          con el objetivo de facilitar decisiones informadas y mejorar el control del proyecto.
        </p>

        <div className="kpi-grid">
          <KPI2Presupuesto />
          <KPI3EstadoCaja />
          <KPI4PagosMensuales />
        </div>
      </div>
    </>
  );
};

export default KPIDashboard;
