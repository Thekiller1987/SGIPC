// src/utils/exportarGastosPDF.js
import jsPDF from "jspdf";

export const generarPDFGastos = (gastos = [], nombreProyecto = "Proyecto") => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Resumen de Gastos - ${nombreProyecto}`, 20, 20);

  let y = 40;

  gastos.forEach((gasto, index) => {
    doc.setFontSize(14);
    doc.text(`#${index + 1} - ${gasto.categoria || "Sin categoría"}`, 20, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Tipo: ${gasto.tipo || "N/A"}`, 25, y); y += 6;
    doc.text(`Fecha: ${gasto.fecha || "N/A"}`, 25, y); y += 6;
    doc.text(`Monto: ${gasto.monto} ${gasto.moneda || ""}`, 25, y); y += 6;
    doc.text(`Archivo: ${gasto.nombreArchivo || "N/A"}`, 25, y); y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  return doc.output("blob");
};
