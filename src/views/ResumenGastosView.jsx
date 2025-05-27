import React, { useEffect, useState, useCallback } from "react";
import { useProject } from "../context/ProjectContext";
import { getGastos } from "../services/gastosService";
import Sidebar from "../components/Sidebar";
import { Document, Packer, Paragraph, TextRun } from "docx"; // Ya corregido
// import { gapi } from "gapi-script"; // ¡ELIMINA ESTA LÍNEA! Ya no necesitamos gapi-script
import { QRCodeCanvas } from "qrcode.react";
import "../GastosCss/ResumenGastos.css";

const CLIENT_ID = "893767644955-smtsidj7upr0sdic3k4ghi66e7r1u5ic.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const ResumenGastosView = () => {
  const { project } = useProject();
  const [gastos, setGastos] = useState([]);
  const [driveLink, setDriveLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrSummaryData, setQrSummaryData] = useState("");
  const [error, setError] = useState(null);
  const [gapiLoaded, setGapiLoaded] = useState(false); // Estado para controlar la carga de gapi

  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, b) => a + Number(b.monto || 0), 0);
  const totalEgresos = gastos.filter(g => g.tipo === "gasto").reduce((a, b) => a + Number(b.monto || 0), 0);
  const balance = totalIngresos - totalEgresos;

  // 1. useEffect para la carga inicial de gapi y la inicialización
  // Ahora gapi se carga globalmente en index.html, solo esperamos a que esté disponible
  useEffect(() => {
    const checkGapiAndInit = () => {
      // Asegurarse de que window.gapi y window.gapi.client estén definidos
      if (window.gapi && window.gapi.client) {
        window.gapi.load("client:auth2", () => {
          if (!window.gapi.auth2.getAuthInstance()) {
            window.gapi.auth2.init({
              client_id: CLIENT_ID,
              scope: SCOPES,
            })
            .then(() => {
              console.log("Google API client initialized successfully (global).");
              setGapiLoaded(true);
            })
            .catch((err) => {
              console.error("Error initializing Google API client (global):", err);
              setError("Error al inicializar la conexión con Google. Revisa tu conexión a internet.");
            });
          } else {
            console.log("Google API client already initialized (global).");
            setGapiLoaded(true);
          }
        });
      } else {
        // Si gapi aún no está disponible, intenta de nuevo después de un breve retraso
        setTimeout(checkGapiAndInit, 100);
      }
    };

    checkGapiAndInit(); // Inicia la verificación/inicialización
  }, []); // Se ejecuta solo una vez al montar el componente

  // 2. useEffect para cargar los gastos cuando el proyecto cambia
  useEffect(() => {
    if (project?.id) {
      getGastos(project.id).then(setGastos);
      setDriveLink("");
      setQrSummaryData("");
      setError(null);
    }
  }, [project]);


  const generarYSubir = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!gapiLoaded) {
        throw new Error("Google API no está cargada o inicializada. Intenta de nuevo en unos segundos.");
      }

      // Acceder a gapi a través de window.gapi
      const auth = window.gapi.auth2.getAuthInstance();
      if (!auth) {
        throw new Error("No se pudo obtener la instancia de autenticación de Google. Recarga la página.");
      }

      if (!auth.isSignedIn.get()) {
        await auth.signIn();
      }
      const accessToken = auth.getToken().access_token;

      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso de Google. Reintenta.");
      }

      // --- Generación del documento Word (tu código actual, sin cambios) ---
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

      // --- Subida a Google Drive (tu código actual, sin cambios) ---
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

      if (!upload.ok) {
        const errorData = await upload.json();
        console.error("Error en la subida a Drive:", errorData);
        throw new Error(`Error al subir el documento: ${errorData.error?.message || upload.statusText}`);
      }

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
      alert("Documento generado y subido con éxito a Google Drive!");
    } catch (error) {
      console.error("Error al generar o subir el documento:", error);
      setError(error.message || "Error desconocido al generar o subir el documento.");
      alert(`Error: ${error.message || "Error al generar o subir el documento"}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSummaryQr = () => {
    setError(null);
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

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <button className="btn btn-warning mt-4" onClick={generarYSubir} disabled={loading || !gapiLoaded}>
            {loading ? "Generando y Subiendo..." : (gapiLoaded ? "Generar Documento y Subir" : "Cargando Google API...")}
          </button>

          <button className="btn btn-info mt-2" onClick={generateSummaryQr}>
            Generar QR Resumen Rápido
          </button>

          {driveLink && (
            <div className="text-center mt-4 qr-container">
              <p>📎 Archivo disponible en Google Drive:</p>
              <a href={driveLink} target="_blank" rel="noopener noreferrer">{driveLink}</a>
              <div className="mt-3">
                <QRCodeCanvas value={driveLink} size={200} level="H" />
                <p className="mt-2 text-muted">Escanea para ver el documento</p>
              </div>
            </div>
          )}

          {qrSummaryData && (
            <div className="text-center mt-4 qr-summary-container">
              <p>Escanea este QR para ver el resumen rápido:</p>
              <div className="mt-3">
                <QRCodeCanvas value={qrSummaryData} size={180} level="H" />
                <p className="mt-2 text-muted">Contenido para **{project?.nombre || 'N/A'}**</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumenGastosView;