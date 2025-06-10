import React, { useEffect, useState, useRef } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useProject } from "../../context/ProjectContext";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ necesario para registrar la función

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const KPI3EstadoCaja = () => {
  const { project } = useProject();
  const [ingresosMes, setIngresosMes] = useState(Array(12).fill(0));
  const [egresosMes, setEgresosMes] = useState(Array(12).fill(0));
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);

  const cardRef = useRef(null);
  const botonRef = useRef(null);

  const tasasCambio = {
    USD: 37,
    EUR: 40.77,
    NIO: 1,
    C$: 1,
  };

  const convertirAMonedaLocal = (monto, moneda) => {
    const tasa = tasasCambio[moneda] || 1;
    return Number(monto) * tasa;
  };

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const obtenerNombreArchivo = (extension) => {
    const nombreProyecto = (project?.nombre || "proyecto").toLowerCase().replace(/\s+/g, "_");
    return `${nombreProyecto}_kpi3_estado_caja_${obtenerFechaActual()}.${extension}`;
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
    link.href = canvas.toDataURL();
    link.download = obtenerNombreArchivo("png");
    link.click();
  };

  const exportarPDF = () => {
  const doc = new jsPDF();
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const tabla = meses.map((mes, i) => [
    mes,
    ingresosMes[i].toFixed(2),
    egresosMes[i].toFixed(2),
  ]);

  doc.text("KPI3 - Estado de Caja", 14, 15);

  autoTable(doc, {
    head: [["Mes", "Ingresos", "Egresos"]],
    body: tabla,
    startY: 20,
    headStyles: {
      fillColor: [211, 84, 0], // ✅ naranja #D35400 en RGB
      textColor: 255, // blanco
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

  const saldo = montoInicial + totalIngresos - totalEgresos;
  doc.text(`Saldo actual: C$${saldo.toLocaleString("es-NI")}`, 14, doc.lastAutoTable.finalY + 10);

  doc.save(obtenerNombreArchivo("pdf"));
};



  const exportarExcel = () => {
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const dataExcel = meses.map((mes, i) => ({
      Mes: mes,
      Ingresos: ingresosMes[i],
      Egresos: egresosMes[i],
    }));

    const hoja = XLSX.utils.json_to_sheet(dataExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Estado de Caja");

    XLSX.writeFile(libro, obtenerNombreArchivo("xlsx"));
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      if (!project?.id) return;

      try {
        const gastosQuery = query(
          collection(db, "gastos"),
          where("projectId", "==", project.id)
        );
        const pagosQuery = query(
          collection(db, "pagos"),
          where("projectId", "==", project.id)
        );

        const [gastosSnap, pagosSnap] = await Promise.all([
          getDocs(gastosQuery),
          getDocs(pagosQuery),
        ]);

        const ingresos = Array(12).fill(0);
        const egresos = Array(12).fill(0);
        let sumaIngresos = 0;
        let sumaEgresos = 0;

        gastosSnap.forEach((doc) => {
          const data = doc.data();
          if (!data.fecha) return;

          const fecha = new Date(data.fecha?.seconds ? data.fecha.toDate() : data.fecha);
          const mes = fecha.getMonth();
          const monto = convertirAMonedaLocal(data.monto || 0, data.moneda || "NIO");

          if (data.tipo === "ingreso") {
            ingresos[mes] += monto;
            sumaIngresos += monto;
          } else if (data.tipo === "gasto" && !data.esPago) {
            egresos[mes] += monto;
            sumaEgresos += monto;
          }
        });

        pagosSnap.forEach((doc) => {
          const data = doc.data();
          if (!data.fecha) return;

          const fecha = new Date(data.fecha?.seconds ? data.fecha.toDate() : data.fecha);
          const mes = fecha.getMonth();
          const monto = convertirAMonedaLocal(data.monto || 0, data.moneda || "NIO");

          egresos[mes] += monto;
          sumaEgresos += monto;
        });

        setIngresosMes(ingresos);
        setEgresosMes(egresos);
        setTotalIngresos(sumaIngresos);
        setTotalEgresos(sumaEgresos);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    obtenerDatos();
  }, [project]);

  const montoInicial = Number(project?.presupuesto || 0);
  const saldo = montoInicial + totalIngresos - totalEgresos;

  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

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
        padding: "1.5rem",
      }}
    >
      <Bar data={data} options={options} />

      <div
        className="kpi-summary"
        style={{
          marginTop: "1.5rem",
          border: "2px solid #D35400",
          borderRadius: "10px",
          padding: "1rem",
          textAlign: "center",
          fontSize: "1.3rem",
          color: "black",
        }}
      >
        <strong style={{ fontSize: "1.6rem" }}>
          C${saldo.toLocaleString("es-NI")}
        </strong>
        <br />
        Saldo actual de la caja
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

export default KPI3EstadoCaja;
