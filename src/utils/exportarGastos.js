import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import * as htmlToImage from "html-to-image";

export const generarDocumentoGastos = async (gastos, nombreProyecto) => {
  const totalIngresos = gastos
    .filter((g) => g.tipo === "ingreso")
    .reduce((sum, g) => sum + Number(g.monto || 0), 0);
  const totalEgresos = gastos
    .filter((g) => g.tipo === "gasto")
    .reduce((sum, g) => sum + Number(g.monto || 0), 0);
  const balance = totalIngresos - totalEgresos;

  const tabla = document.getElementById("tabla-gastos-export");
  if (!tabla) throw new Error("La tabla no está disponible para exportar.");

  const dataUrl = await htmlToImage.toPng(tabla);
  const imageBlob = await fetch(dataUrl).then((res) => res.blob());
  const imageBuffer = await imageBlob.arrayBuffer();

  const doc = new Document({
    sections: [
      {
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
          }),
          new Paragraph(" "),
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 320,
                },
              }),
            ],
          }),
          new Paragraph(" "),
          new Paragraph({
            children: [new TextRun({ text: `Total Ingresos: ${totalIngresos} NIO`, bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Total Egresos: ${totalEgresos} NIO`, bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Balance Final: ${balance} NIO`, bold: true })],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
