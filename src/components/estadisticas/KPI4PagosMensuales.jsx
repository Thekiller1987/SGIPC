import React, { useEffect, useState, useRef } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useProject } from "../../context/ProjectContext";
import { Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const KPI4PagosMensuales = () => {
  const { project } = useProject();
  const [categorias, setCategorias] = useState({});
  const cardRef = useRef(null);
  const botonRef = useRef(null);

  const descargarKPI = async () => {
    if (!cardRef.current) return;

    if (botonRef.current) botonRef.current.style.display = "none";

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    if (botonRef.current) botonRef.current.style.display = "block";

    const link = document.createElement("a");
    link.download = "kpi4_egresos_por_categoria.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    const obtenerCategorias = async () => {
      if (!project?.id) return;

      try {
        const gastosRef = collection(db, "gastos");
        const q = query(gastosRef, where("projectId", "==", project.id));
        const snapshot = await getDocs(q);

        const conteo = {};
        snapshot.docs.forEach((doc) => {
          const cat = doc.data().categoria || "Otros";
          conteo[cat] = (conteo[cat] || 0) + 1;
        });

        setCategorias(conteo);
      } catch (error) {
        console.error("Error al obtener categorías de gastos:", error);
      }
    };

    obtenerCategorias();
  }, [project]);

  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);

  const coloresBase = ["#D35400", "#E3A008", "#5B6F8F", "#C0392B", "#1ABC9C", "#8E44AD"];
  const coloresUsados = coloresBase.slice(0, labels.length);

  const data = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: coloresUsados,
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "right",
        labels: { color: "black" },
      },
      title: {
        display: true,
        text: "Egresos por categoría",
        color: "black",
      },
    },
  };

  return (
    <div ref={cardRef} className="kpi-card" style={{ backgroundColor: "white", border: "2px solid #D35400", borderRadius: "15px", padding: "1.5rem" }}>
      <Pie data={data} options={options} />

      <button
        ref={botonRef}
        onClick={descargarKPI}
        style={{
          marginTop: "1.5rem",
          padding: "0.6rem 1.2rem",
          backgroundColor: "#D35400",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        Descargar KPI completo
      </button>
    </div>
  );
};

export default KPI4PagosMensuales;


