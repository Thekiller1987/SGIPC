import React, { useEffect, useState } from "react";
import { useProject } from "../context/ProjectContext";
import { getGastos } from "../services/gastosService";
import Sidebar from "../components/Sidebar";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { gapi } from "gapi-script";
import { QRCodeCanvas } from "qrcode.react";
import "../GastosCss/ResumenGastos.css";

const CLIENT_ID = "893767644955-smtsidj7upr0sdic3k4ghi66e7r1u5ic.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const ResumenGastosView = () => {
  const { project } = useProject();
  const [gastos, setGastos] = useState([]);
  const [driveLink, setDriveLink] = useState("");
  const [loading, setLoading] = useState(false);
  // Nuevo estado para almacenar la data del QR de resumen
  const [qrSummaryData, setQrSummaryData] = useState("");

  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, b) => a + Number(b.monto || 0), 0);
  const totalEgresos = gastos.filter(g => g.tipo === "gasto").reduce((a, b) => a + Number(b.monto || 0), 0);
  const balance = totalIngresos - totalEgresos;

  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.auth2.init({ client_id: CLIENT_ID, scope: SCOPES });
    });
    if (project?.id) getGastos(project.id).then(setGastos);
  }, [project]);

  const generarYSubir = async () => {
    try {
      setLoading(true);

      const children = [
        new Paragraph({
          children: [
            new TextRun({
              text: `Resumen de Gastos - ${project?.nombre}`,
              bold: true,
              size: 32,
              color: "2E74B5",
            }),
          ],
        }),
        new Paragraph(" "),
      ];

      gastos.forEach((g, i) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `#${i + 1}\n`, bold: true }),
              new TextRun(`Categoría: ${g.categoria || "N/A"}\n`, { bold: true }),
              new TextRun(`Tipo: ${g.tipo || "N/A"}\n`, { bold: true }),
              new TextRun(`Fecha: ${g.fecha || "N/A"}\n`, { bold: true }),
              new TextRun(`Monto: ${g.monto || 0} ${g.moneda || "NIO"}\n`, { bold: true }),
              new TextRun(`Archivo: ${g.nombreArchivo || "Sin archivo"}`),
            ]
          }),
          new Paragraph(" ")
        );
      });

      children.push(new Paragraph(" "));
      children.push(new Paragraph({ children: [new TextRun({ text: `Total Ingresos: ${totalIngresos} NIO`, bold: true })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: `Total Egresos: ${totalEgresos} NIO`, bold: true })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: `Balance Final: ${balance} NIO`, bold: true })] }));

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);

      const auth = gapi.auth2.getAuthInstance();
      if (!auth.isSignedIn.get()) await auth.signIn();
      const accessToken = gapi.auth.getToken().access_token;

      const metadata = {
        name: `ResumenGastos_${project?.nombre}.docx`,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", blob);

      const upload = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });

      const uploadData = await upload.json();

      await fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      });

      setDriveLink(`https://drive.google.com/file/d/${uploadData.id}/view`);
    } catch (error) {
      console.error("Error al generar o subir el documento:", error);
      alert("Error al generar o subir el documento");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para generar el QR con la información específica
  const generateSummaryQr = () => {
    const summaryInfo =
      `Proyecto: ${project?.nombre || 'N/A'}\n` +
      `Ingresos: ${totalIngresos} NIO\n` +
      `Egresos: ${totalEgresos} NIO\n` +
      `Balance: ${balance} NIO`;
    setQrSummaryData(summaryInfo);
  };

  return (
    <div className="layout-gastos">
      <Sidebar />
      <div className="gastos-container">
        <div className="gastos-card">
          <h2 className="titulo-proyecto">Resumen de Gastos</h2>
          <p className="nombre-proyecto">Proyecto: <strong>{project?.nombre}</strong></p>

       <div className="resumen-totales mt-3">
  <p>
    <strong>Total Ingresos: </strong>
    <span style={{ color: "green", fontWeight: "bold" }}>{totalIngresos} NIO</span>
  </p>
  <p>
    <strong>Total Egresos: </strong>
    <span style={{ color: "red", fontWeight: "bold" }}>{totalEgresos} NIO</span>
  </p>
  <p>
    <strong>Balance Final: </strong>
    <span style={{ color: balance >= 0 ? "green" : "red", fontWeight: "bold" }}>
      {balance} NIO
    </span>
  </p>
</div>

          <button className="btn btn-warning mt-4" onClick={generarYSubir} disabled={loading}>
            {loading ? "Generando y Subiendo..." : "Generar Documento y Subir"}
          </button>

          {/* Nuevo botón para generar el QR solo con la información de resumen */}
          <button className="btn btn-info mt-2" onClick={generateSummaryQr}>
            Generar QR Resumen Rápido
          </button>

          {driveLink && (
            <div className="text-center mt-4">
              <p>📎 Archivo disponible en:</p>
              <a href={driveLink} target="_blank" rel="noopener noreferrer">{driveLink}</a>
              <div className="mt-3">
                <QRCodeCanvas value={driveLink} size={200} />
                <p className="mt-2 text-muted">Escanea para ver el documento</p>
              </div>
            </div>
          )}

          {/* Mostrar el QR de resumen si qrSummaryData tiene contenido */}
          {qrSummaryData && (
            <div className="text-center mt-4 qr-summary-container">
              <p>Escanea este QR para ver el resumen rápido:</p>
              <div className="mt-3">
                <QRCodeCanvas value={qrSummaryData} size={180} level="H" />
                <p className="mt-2 text-muted">Contenido: **{project?.nombre}**</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumenGastosView;