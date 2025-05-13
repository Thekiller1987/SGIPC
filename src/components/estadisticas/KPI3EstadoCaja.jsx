import React, { useEffect, useState, useRef } from "react";
import { db } from "../../database/authcontext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useProject } from "../../context/ProjectContext";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const KPI3EstadoCaja = () => {
  const { project } = useProject();
  const [ingresosMes, setIngresosMes] = useState(Array(12).fill(0));
  const [egresosMes, setEgresosMes] = useState(Array(12).fill(0));
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);

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
    link.href = canvas.toDataURL();
    link.download = "kpi3_estado_caja.png";
    link.click();
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      if (!project?.id) return;

      try {
        // Ingresos
        const pagosRef = collection(db, "pagos");
        const pagosQuery = query(pagosRef, where("projectId", "==", project.id));
        const pagosSnap = await getDocs(pagosQuery);

        const ingresos = Array(12).fill(0);
        let sumaIngresos = 0;

        pagosSnap.docs.forEach(doc => {
          const data = doc.data();
          const fecha = new Date(data.fecha?.seconds ? data.fecha.toDate() : data.fecha);
          const mes = fecha.getMonth();
          const monto = parseFloat(data.monto || 0);
          ingresos[mes] += monto;
          sumaIngresos += monto;
        });

        setIngresosMes(ingresos);
        setTotalIngresos(sumaIngresos);

        // Egresos
        const gastosRef = collection(db, "gastos");
        const gastosQuery = query(gastosRef, where("projectId", "==", project.id));
        const gastosSnap = await getDocs(gastosQuery);

        const egresos = Array(12).fill(0);
        let sumaEgresos = 0;

        gastosSnap.docs.forEach(doc => {
          const data = doc.data();
          const fecha = new Date(data.fecha?.seconds ? data.fecha.toDate() : data.fecha);
          const mes = fecha.getMonth();
          const monto = parseFloat(data.monto || 0);
          egresos[mes] += monto;
          sumaEgresos += monto;
        });

        setEgresosMes(egresos);
        setTotalEgresos(sumaEgresos);
      } catch (error) {
        console.error("Error al obtener ingresos y egresos:", error);
      }
    };

    obtenerDatos();
  }, [project]);

  const saldo = totalIngresos - totalEgresos;

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const data = {
    labels: meses,
    datasets: [
      {
        label: "Ingresos",
        data: ingresosMes,
        backgroundColor: "#E3A008",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 5,
      },
      {
        label: "Egresos",
        data: egresosMes,
        backgroundColor: "#D35400",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "black" },
      },
      title: {
        display: true,
        text: "Ingresos vs Egresos por mes",
        color: "black",
      },
    },
    scales: {
      x: { ticks: { color: "black" } },
      y: { ticks: { color: "black" }, beginAtZero: true },
    },
  };

  return (
    <div ref={cardRef} className="kpi-card" style={{ backgroundColor: "white", border: "2px solid #D35400", borderRadius: "15px", padding: "1.5rem" }}>
      <Bar data={data} options={options} />

      <div className="kpi-summary" style={{
        marginTop: "1.5rem",
        border: "2px solid #D35400",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
        fontSize: "1.3rem",
        color: "black"
      }}>
        <strong style={{ fontSize: "1.6rem" }}>C${saldo.toLocaleString("es-NI")}</strong><br />
        Saldo actual de la caja
      </div>

      <button
        ref={botonRef}
        onClick={descargarKPI}
        style={{
          marginTop: "1rem",
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

export default KPI3EstadoCaja;

///// no se