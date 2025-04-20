import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../assets/database/firebaseconfig";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useProject } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import "../DocumentosYPlanosViewCSS/ArchivosOverview.css";
import editIcon from "../assets/iconos/edit.png";
import deleteIcon from "../assets/iconos/delete.png";
import downloadIcon from "../assets/iconos/archivo.png";
import eyeIcon from "../assets/iconos/ojo.png";
import checkIcon from "../assets/iconos/check.png";
import mammoth from "mammoth";
import iconoBuscar from "../assets/iconos/search.png";

const ArchivoOverview = () => {
  const { project } = useProject();
  const [documentos, setDocumentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [documentoPrevisualizar, setDocumentoPrevisualizar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocumentos = async () => {
      if (!project) return;

      try {
        const proyectoRef = doc(db, "proyectos", project.id);
        const documentosRef = collection(proyectoRef, "documentos");
        const querySnapshot = await getDocs(documentosRef);
        const documentosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocumentos(documentosList);
      } catch (error) {
        console.error("❌ Error al obtener los documentos:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000); // Simulación para ver loader
      }
    };

    fetchDocumentos();
  }, [project]);

  const iniciarEdicion = (documento) => {
    setEditandoId(documento.id);
    setFormEdit({
      nombre: documento.nombre,
      tipoDocumento: documento.tipoDocumento,
      archivoBase64: documento.archivoBase64,
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({});
  };

  const guardarCambios = async (id) => {
    try {
      const ref = doc(db, "proyectos", project.id, "documentos", id);
      await updateDoc(ref, formEdit);
      const actualizados = documentos.map((doc) =>
        doc.id === id ? { ...doc, ...formEdit } : doc
      );
      setDocumentos(actualizados);
      cancelarEdicion();
    } catch (error) {
      console.error("❌ Error actualizando documento:", error);
    }
  };

  const eliminarDocumento = async (id) => {
    if (window.confirm("¿Deseas eliminar este documento?")) {
      try {
        await deleteDoc(doc(db, "proyectos", project.id, "documentos", id));
        setDocumentos(documentos.filter((doc) => doc.id !== id));
      } catch (error) {
        console.error("❌ Error al eliminar documento:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEdit((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setFormEdit((prev) => ({ ...prev, archivoBase64: base64 }));
      };
      reader.readAsDataURL(archivo);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const abrirModalPrevisualizacion = (documento) => {
    setDocumentoPrevisualizar(documento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDocumentoPrevisualizar(null);
  };

  const renderPrevisualizacion = () => {
    if (!documentoPrevisualizar) return null;

    const { archivoBase64, nombre } = documentoPrevisualizar;

    if (archivoBase64.startsWith("data:image/")) {
      return (
        <img
          src={archivoBase64}
          alt={nombre}
          style={{ width: "100%", maxHeight: "600px", objectFit: "contain" }}
        />
      );
    }

    if (archivoBase64.startsWith("data:application/pdf")) {
      return (
        <iframe
          src={archivoBase64}
          width="100%"
          height="600px"
          title="PDF Viewer"
          style={{ border: "none" }}
        />
      );
    }

    if (
      archivoBase64.startsWith(
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      const arrayBuffer = base64ToArrayBuffer(archivoBase64);
      mammoth
        .extractRawText({ arrayBuffer: arrayBuffer })
        .then((result) => {
          document.getElementById("previsualizacion-word").innerHTML =
            result.value;
        })
        .catch((error) => {
          console.error("❌ Error al extraer contenido de Word:", error);
        });

      return (
        <div
          id="previsualizacion-word"
          style={{ width: "100%", height: "600px", overflowY: "auto" }}
        ></div>
      );
    }

    return <p>No se puede previsualizar este tipo de archivo.</p>;
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64.split(",")[1]);
    const length = binaryString.length;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Uint8Array(arrayBuffer);

    for (let i = 0; i < length; i++) {
      view[i] = binaryString.charCodeAt(i);
    }

    return arrayBuffer;
  };

  const documentosFiltrados = documentos.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const nombre = doc.nombre.toLowerCase();
    const tipo = doc.tipoDocumento.toLowerCase();
    const fecha = formatFecha(doc.fechaSubida).toLowerCase();
    return nombre.includes(term) || tipo.includes(term) || fecha.includes(term);
  });

  if (loading) {
    return (
      <div className="archivo-overview-loader">
        <div className="wave-loader">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <p>Cargando documentos...</p>
      </div>
    );
  }

  return (
    <div className="archivo-overview-fondo">
      <h2 className="archivo-overview-titulo">Documentos y Planos Subidos</h2>
      <Sidebar />
      <div className="archivo-overview-wrapper">
        <div className="archivo-overview-contenedor">
          {project && (
            <h3 className="archivo-overview-nombre-proyecto">
              {project.nombre}
            </h3>
          )}

          <div className="archivo-overview-buscador-contenedor">
            <img
              src={iconoBuscar}
              alt="Buscar"
              className="archivo-overview-icono-buscar"
            />
            <input
              type="text"
              className="archivo-overview-buscador"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..." // Puedes mantener un placeholder si deseas.
            />
          </div>

          <div className="archivo-overview-tabla-scroll">
            {documentosFiltrados.length === 0 ? (
              <p>No se han subido documentos o planos aún.</p>
            ) : (
              <table className="archivo-overview-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Fecha de Subida</th>
                    {editandoId && <th>Editar</th>}
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {documentosFiltrados.map((documento) => {
                    const esEditando = editandoId === documento.id;
                    return (
                      <tr
                        key={documento.id}
                        className={
                          esEditando ? "archivo-overview-fila-seleccionada" : ""
                        }
                      >
                        {esEditando ? (
                          <>
                            <td>
                              <input
                                type="text"
                                name="nombre"
                                value={formEdit.nombre}
                                onChange={handleChange}
                                className="archivo-overview-input"
                              />
                            </td>
                            <td>
                              <select
                                name="tipoDocumento"
                                value={formEdit.tipoDocumento}
                                onChange={handleChange}
                                className="archivo-overview-input"
                              >
                                <option value="documento">Documento</option>
                                <option value="plano">Plano</option>
                              </select>
                            </td>
                            <td>{formatFecha(documento.fechaSubida)}</td>
                            <td>
                              <input
                                type="file"
                                onChange={handleFileChange}
                                className="archivo-overview-input"
                              />
                            </td>
                            <td className="archivo-overview-acciones">
                              <button
                                onClick={() => guardarCambios(documento.id)}
                              >
                                <img src={checkIcon} alt="Confirmar" />
                              </button>
                              <button onClick={cancelarEdicion}>
                                <img src={deleteIcon} alt="Cancelar" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{documento.nombre}</td>
                            <td>{documento.tipoDocumento}</td>
                            <td>{formatFecha(documento.fechaSubida)}</td>
                            <td className="archivo-overview-acciones">
                              <button
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = documento.archivoBase64;
                                  link.download =
                                    documento.nombre || "documento";
                                  link.click();
                                }}
                              >
                                <img src={downloadIcon} alt="Descargar" />
                              </button>
                              <button
                                onClick={() =>
                                  abrirModalPrevisualizacion(documento)
                                }
                              >
                                <img src={eyeIcon} alt="Ver" />
                              </button>
                              <button onClick={() => iniciarEdicion(documento)}>
                                <img src={editIcon} alt="Editar" />
                              </button>
                              <button
                                onClick={() => eliminarDocumento(documento.id)}
                              >
                                <img src={deleteIcon} alt="Eliminar" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {modalAbierto && (
            <div className="archivo-overview-modal">
              <div className="archivo-overview-modal-contenido">
                <span
                  className="archivo-overview-modal-cerrar"
                  onClick={cerrarModal}
                >
                  &times;
                </span>
                {renderPrevisualizacion()}
              </div>
            </div>
          )}

          <button
            className="archivo-overview-boton-documento"
            onClick={() => navigate("/Documentos")}
          >
            Registrar Documento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivoOverview;
