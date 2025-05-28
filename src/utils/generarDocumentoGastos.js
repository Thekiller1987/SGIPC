// src/utils/exportarGastos.js
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import htmlToImage from "html-to-image";

export const generarDocumentoGastos = async (gastos, nombreProyecto) => {
  try {
    // Captura del nodo de la tabla con ID específico
    const tablaNode = document.getElementById("tabla-gastos");
    if (!tablaNode) throw new Error("No se encontró la tabla de gastos");

    const dataUrl = await htmlToImage.toPng(tablaNode);
    const response = await fetch(dataUrl);
    const blobImage = await response.blob();
    const arrayBuffer = await blobImage.arrayBuffer();

    const totalIngresos = gastos
      .filter((g) => g.tipo === "ingreso")
      .reduce((acc, g) => acc + Number(g.monto || 0), 0);
    const totalEgresos = gastos
      .filter((g) => g.tipo === "gasto")
      .reduce((acc, g) => acc + Number(g.monto || 0), 0);
    const balance = totalIngresos - totalEgresos;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Resumen de Gastos - ${nombreProyecto}`,
                  bold: true,
                  size: 32,
                  color: "2E74B5",
                }),
              ],
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: arrayBuffer,
                  transformation: {
                    width: 650,
                    height: 300,
                  },
                }),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Total Ingresos: ${totalIngresos} NIO`, bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Total Egresos: ${totalEgresos} NIO`, bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Balance Final: ${balance} NIO`, bold: true }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  } catch (error) {
    console.error("Error al generar documento:", error);
    throw error;
  }
};
