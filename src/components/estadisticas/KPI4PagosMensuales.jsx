import React, { useEffect, useState, useRef } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useProject } from "../../context/ProjectContext";
import { Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const obtenerNombreArchivo = (extension) => {
    const nombreProyecto = (project?.nombre || "proyecto").toLowerCase().replace(/\s+/g, "_");
    return `${nombreProyecto}_kpi4_egresos_categoria_${obtenerFechaActual()}.${extension}`;
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

    const tabla = Object.entries(categorias).map(([categoria, cantidad]) => [
      categoria,
      cantidad,
    ]);

    doc.text("KPI4 - Egresos por Categoría", 14, 15);
    autoTable(doc, {
      head: [["Categoría", "Cantidad de egresos"]],
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

    doc.save(obtenerNombreArchivo("pdf"));
  };

  const exportarExcel = () => {
    const dataExcel = Object.entries(categorias).map(([categoria, cantidad]) => ({
      Categoría: categoria,
      "Cantidad de egresos": cantidad,
    }));

    const hoja = XLSX.utils.json_to_sheet(dataExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Egresos por categoría");

    XLSX.writeFile(libro, obtenerNombreArchivo("xlsx"));
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
      <Pie data={data} options={options} />

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

export default KPI4PagosMensuales;
