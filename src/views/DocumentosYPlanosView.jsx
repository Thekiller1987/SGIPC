import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../assets/database/firebaseconfig";
import { addDoc, collection, serverTimestamp, doc } from "firebase/firestore";
import { useProject } from "../context/ProjectContext";
import "../DocumentosYPlanosViewCSS/DocumentosYPlanosView.css";

const DocumentosYPlanosView = () => {
  const { project } = useProject();
  const [file, setFile] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState("Documento");
  const [nombre, setNombre] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [showToast, setShowToast] = useState(false); // ✅ Toast de éxito

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleTipoDocumentoChange = (e) => setTipoDocumento(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !nombre || !project) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setSubiendo(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result;
      try {
        const fechaSubida = new Date().toISOString();
        
        // Aquí modificamos la colección para que guarde los documentos en una subcolección
        const proyectoRef = doc(db, "proyectos", project.id); // Documento del proyecto
        const documentosRef = collection(proyectoRef, "documentos"); // Subcolección 'documentos' dentro del proyecto
        
        await addDoc(documentosRef, {
          nombre,
          proyecto: project.nombre,
          tipoDocumento,
          fechaSubida,
          archivoBase64: base64String,
          timestamp: serverTimestamp(),
        });
        setShowToast(true); // ✅ Mostrar toast
        setTimeout(() => setShowToast(false), 3000); // Ocultar después de 3s
        setNombre("");
        setFile(null);
        setTipoDocumento("Documento");
      } catch (error) {
        console.error("Error al cargar el archivo:", error);
        alert("Hubo un error al cargar el archivo. Inténtalo de nuevo.");
      } finally {
        setSubiendo(false);
      }
    };
    reader.onerror = () => {
      alert("Error al leer el archivo.");
      setSubiendo(false);
    };
  };

  return (
    <div className="doc-plan-app-container">
      <Sidebar />
      <div className="doc-plan-content-wrapper">
        <div className="doc-plan-container">
          <h2 className="doc-plan-title">Subir Documento o Plano</h2>
          <form onSubmit={handleSubmit} className="doc-plan-form-upload">
            {project && (
              <div className="doc-plan-project-name">
                <strong>{project.nombre}</strong>
              </div>
            )}

            <div className="doc-plan-form-group">
              <label htmlFor="tipoDocumento" className="doc-plan-label">
                Tipo de Archivo
              </label>
              <select
                id="tipoDocumento"
                value={tipoDocumento}
                onChange={handleTipoDocumentoChange}
                className="doc-plan-select"
              >
                <option value="Documento">Documento</option>
                <option value="Plano">Plano</option>
              </select>
            </div>

            <div className="doc-plan-form-group">
              <label htmlFor="nombre" className="doc-plan-label">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="doc-plan-input"
              />
            </div>

            <div className="doc-plan-form-group">
              <label htmlFor="file" className="doc-plan-label">
                Seleccionar Archivo
              </label>
              <input
                id="file"
                type="file"
                className="doc-plan-input"
                accept={
                  tipoDocumento === "Plano"
                    ? ".pdf,.gbl,.dwg"
                    : "application/pdf,.doc,.docx,.txt"
                }
                onChange={handleFileChange}
                required
              />
            </div>

            <button
              type="submit"
              className="doc-plan-submit-btn"
              disabled={subiendo}
            >
              {subiendo ? "Subiendo..." : `Subir ${tipoDocumento}`}
            </button>
          </form>

          {showToast && (
            <div className="doc-plan-toast-success">
              ✅ Archivo cargado correctamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentosYPlanosView;
