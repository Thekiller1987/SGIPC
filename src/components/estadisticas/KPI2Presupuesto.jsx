import React, { useEffect, useState, useRef } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useProject } from "../../context/ProjectContext";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

const KPI2PagosPorMes = () => {
  const { project } = useProject();
  const [conteoPorMes, setConteoPorMes] = useState(Array(12).fill(0));
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const cardRef = useRef(null);
  const botonRef = useRef(null);

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const obtenerNombreArchivo = (extension) => {
    const nombreProyecto = (project?.nombre || "proyecto").toLowerCase().replace(/\s+/g, "_");
    return `${nombreProyecto}_kpi2_pagos_por_mes_${obtenerFechaActual()}.${extension}`;
  };

  const descargarKPI = async () => {
    if (!cardRef.current) return;
    if (botonRef.current) botonRef.current.style.display = "none";

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    if (botonRef.current) botonRef.current.style.display = "block";

    const link = document.createElement("a");
    link.download = obtenerNombreArchivo("png");
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    const tabla = meses.map((mes, i) => [
      mes,
      conteoPorMes[i],
    ]);

    doc.text("KPI2 - Pagos realizados por mes", 14, 15);
    autoTable(doc, {
      head: [["Mes", "Cantidad de pagos"]],
      body: tabla,
      startY: 20,
      headStyles: {
        fillColor: [211, 84, 0], // naranja #D35400
        textColor: 255,
        halign: "center",
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.text(`Total: ${cantidadTotal} pagos`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(obtenerNombreArchivo("pdf"));
  };

  const exportarExcel = () => {
    const dataExcel = meses.map((mes, i) => ({
      Mes: mes,
      Pagos: conteoPorMes[i],
    }));

    const hoja = XLSX.utils.json_to_sheet(dataExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Pagos por mes");

    XLSX.writeFile(libro, obtenerNombreArchivo("xlsx"));
  };

  useEffect(() => {
    const obtenerPagos = async () => {
      if (!project?.id) return;

      try {
        const pagosRef = collection(db, "pagos");
        const q = query(pagosRef, where("projectId", "==", project.id));
        const snapshot = await getDocs(q);

        const pagosPorMes = Array(12).fill(0);
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const fecha = new Date(data.fecha?.seconds ? data.fecha.toDate() : data.fecha);
          const mes = fecha.getMonth();
          pagosPorMes[mes]++;
        });

        setConteoPorMes(pagosPorMes);
        setCantidadTotal(snapshot.size);
      } catch (error) {
        console.error("Error al obtener pagos:", error);
      }
    };

    obtenerPagos();
  }, [project]);

  const data = {
    labels: meses,
    datasets: [
      {
        label: "Pagos por mes",
        data: conteoPorMes,
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
        text: "Cantidad de pagos realizados por mes",
        color: "black",
      },
    },
    scales: {
      x: {
        ticks: { color: "black" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "black" },
      },
    },
  };

const estiloBoton = {
  marginTop: "0.7rem",
  width: "220px",            // ✅ Mismo ancho para todos
  padding: "0.6rem 1rem",    // ✅ Ajuste uniforme
  backgroundColor: "#D35400",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "center",       // ✅ Alineación interna
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
};


  return (
    <div
      ref={cardRef}
      className="kpi-card"
      style={{
        backgroundColor: "white",
        border: "2px solid #D35400",
        borderRadius: "15px",
        padding: "1.5rem"
      }}
    >
      <Bar data={data} options={options} />

      <div className="kpi-summary" style={{
        marginTop: "1.5rem",
        border: "2px solid #D35400",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
        color: "black",
        fontSize: "1.2rem"
      }}>
        <strong style={{ fontSize: "1.5rem", color: "#D35400" }}>
          {cantidadTotal}
        </strong>
        <br />
        Cantidad de pagos registrados
      </div>

      <button ref={botonRef} onClick={descargarKPI} style={estiloBoton}>
        Descargar KPI completo
      </button>
      <button onClick={exportarPDF} style={estiloBoton}>
        Exportar a PDF
      </button>
      <button onClick={exportarExcel} style={estiloBoton}>
        Exportar a Excel
      </button>
    </div>
  );
};

export default KPI2PagosPorMes;
