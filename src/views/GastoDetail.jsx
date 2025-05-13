import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Modal } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import { updateGasto, deleteGasto } from "../services/gastosService";
import {
  getCategoriasPorProyecto,
  guardarNuevaCategoria,
} from "../services/categoriasService";
import "../GastosCss/GastoDetail.css";
import editIcon from "../assets/iconos/edit.png";
import checkIcon from "../assets/iconos/check.png";
import deleteIcon from "../assets/iconos/delete.png";

const formatFechaParaInput = (fecha) => {
  if (typeof fecha === "string") return fecha;
  const date = fecha?.toDate ? fecha.toDate() : new Date(fecha);
  return date.toISOString().split("T")[0];
};

const getSimboloMoneda = (codigo) => {
  switch (codigo) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "NIO":
      return "C$";
    default:
      return "";
  }
};

const formatNumber = (value) => {
  const num = value.toString().replace(/[^\d.]/g, "");
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const cleanNumber = (value) => parseFloat(value.toString().replace(/,/g, ""));

const GastoDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gasto, projectId } = location.state || {};

  const [modoEdicion, setModoEdicion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [errores, setErrores] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [agregandoCategoria, setAgregandoCategoria] = useState(false);

  const [datosEditables, setDatosEditables] = useState({
    categoria: gasto.categoria || "",
    fecha: formatFechaParaInput(gasto.fecha),
    monto: formatNumber(gasto.monto || ""),
    moneda: gasto.moneda || "NIO",
    facturaBase64: gasto.facturaBase64 || "",
    nombreArchivo: gasto.nombreArchivo || "",
  });

  useEffect(() => {
    const cargarCategorias = async () => {
      const lista = await getCategoriasPorProyecto(projectId);
      setCategorias(lista);
    };
    cargarCategorias();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosEditables({ ...datosEditables, [name]: value });
  };

  const handleFileChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDatosEditables({
        ...datosEditables,
        facturaBase64: reader.result,
        nombreArchivo: archivo.name,
      });
    };
    reader.readAsDataURL(archivo);
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    if (!datosEditables.categoria.trim())
      nuevosErrores.categoria = "Este campo es requerido";
    if (!datosEditables.fecha.trim())
      nuevosErrores.fecha = "Este campo es requerido";
    if (!datosEditables.monto.toString().trim())
      nuevosErrores.monto = "Este campo es requerido";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (gasto.esPago) {
      alert("❌ Este gasto proviene de un pago (Caja) y no puede editarse.");
      setModoEdicion(false);
      return;
    }

    if (!validarCampos()) return;

    try {
      await updateGasto(gasto.id, {
        ...datosEditables,
        monto: cleanNumber(datosEditables.monto),
        fecha: datosEditables.fecha,
      });
      setModoEdicion(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
    }
  };

  const handleAgregarCategoria = async () => {
    if (nuevaCategoria.trim() && !categorias.includes(nuevaCategoria)) {
      try {
        const nuevas = await guardarNuevaCategoria(projectId, nuevaCategoria);
        setCategorias(nuevas);
        setDatosEditables({ ...datosEditables, categoria: nuevaCategoria });
        setNuevaCategoria("");
        setAgregandoCategoria(false);
      } catch (err) {
        console.error("No se pudo guardar la nueva categoría:", err);
      }
    }
  };

  const handleEliminar = async () => {
    if (gasto.esPago) {
      alert("❌ Este gasto proviene de un pago (Caja) y no puede eliminarse.");
      setShowModal(false);
      return;
    }

    try {
      await deleteGasto(gasto.id);
      setShowModal(false);
      navigate("/gastos-overview", { state: { projectId } });
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
    }
  };

  return (
    <div className="detalle-gasto-layout">
      <Sidebar />
      <div className="dg-contenido-principal">
        <Card className="detalle-gasto-card">
          <div className="dg-header">
            <h2 className="dg-titulo">Detalle de Gasto</h2>
            <div className="dg-iconos">
              {!gasto.esPago ? (
                modoEdicion ? (
                  <div
                    className="dg-icono"
                    onClick={handleGuardar}
                    title="Guardar cambios"
                  >
                    <img src={checkIcon} alt="Guardar" />
                  </div>
                ) : (
                  <div
                    className="dg-icono"
                    onClick={() => setModoEdicion(true)}
                    title="Editar gasto"
                  >
                    <img src={editIcon} alt="Editar" />
                  </div>
                )
              ) : (
                <div
                  className="dg-icono"
                  style={{ opacity: 0.4, cursor: "not-allowed" }}
                  title="Este gasto proviene de Caja y no puede editarse"
                >
                  <img src={editIcon} alt="No editable" />
                </div>
              )}

              {!gasto.esPago ? (
                <div
                  className="dg-icono"
                  onClick={() => setShowModal(true)}
                  title="Eliminar gasto"
                >
                  <img src={deleteIcon} alt="Eliminar" />
                </div>
              ) : (
                <div
                  className="dg-icono"
                  style={{ opacity: 0.4, cursor: "not-allowed" }}
                  title="Este gasto proviene de un pago y no puede eliminarse"
                >
                  <img src={deleteIcon} alt="No se puede eliminar" />
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="dg-campo">
            <label>Categoría de Gasto :</label>
            {modoEdicion ? (
              <div className="dg-campo-col">
                <select
                  name="categoria"
                  className="dg-select"
                  value={datosEditables.categoria}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "nueva") {
                      setAgregandoCategoria(true);
                      setDatosEditables({ ...datosEditables, categoria: "" });
                    } else {
                      setDatosEditables({
                        ...datosEditables,
                        categoria: value,
                      });
                      setAgregandoCategoria(false);
                    }
                  }}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="nueva">-- Agregar nueva categoría --</option>
                </select>
                {agregandoCategoria && (
                  <div className="dg-nueva-categoria">
                    <input
                      type="text"
                      value={nuevaCategoria}
                      placeholder="Nueva categoría"
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      className="dg-input"
                    />
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleAgregarCategoria}
                      style={{ marginTop: "0.5rem" }}
                    >
                      Guardar Categoría
                    </Button>
                  </div>
                )}
                {errores.categoria && (
                  <div className="dg-error">{errores.categoria}</div>
                )}
              </div>
            ) : (
              <span className="dg-valor">{datosEditables.categoria}</span>
            )}
          </div>

          {/* Fecha */}
          <div className="dg-campo">
            <label>Fecha :</label>
            <div className="dg-campo-col">
              <input
                type="date"
                name="fecha"
                className="dg-input"
                value={datosEditables.fecha}
                onChange={handleChange}
                disabled={!modoEdicion}
              />
              {errores.fecha && <div className="dg-error">{errores.fecha}</div>}
            </div>
          </div>

          {/* Monto */}
          <div className="dg-campo">
            <label>Monto Gastado :</label>
            <div className="dg-campo-col d-flex" style={{ gap: "10px" }}>
              {modoEdicion ? (
                <>
                  <select
                    name="moneda"
                    className="dg-select"
                    style={{ maxWidth: "90px" }}
                    value={datosEditables.moneda}
                    onChange={(e) =>
                      setDatosEditables({
                        ...datosEditables,
                        moneda: e.target.value,
                      })
                    }
                  >
                    <option value="USD">$</option>
                    <option value="EUR">€</option>
                    <option value="NIO">C$</option>
                  </select>
                  <input
                    type="text"
                    name="monto"
                    className="dg-input"
                    value={datosEditables.monto}
                    onChange={(e) =>
                      setDatosEditables({
                        ...datosEditables,
                        monto: formatNumber(e.target.value),
                      })
                    }
                  />
                </>
              ) : (
                <span className="dg-valor">
                  {getSimboloMoneda(datosEditables.moneda)}{" "}
                  {formatNumber(datosEditables.monto)}
                </span>
              )}
              {errores.monto && <div className="dg-error">{errores.monto}</div>}
            </div>
          </div>

          {/* Factura */}
          <div className="dg-campo">
            <label>Factura Adjunta :</label>
            <div className="dg-factura">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                disabled={!modoEdicion}
                className="dg-btn-adjunta"
              />
              <span
                className="dg-factura-nombre"
                onClick={() =>
                  datosEditables.facturaBase64 && setShowFacturaModal(true)
                }
                style={{
                  cursor: "pointer",
                  color: "#007bff",
                  textDecoration: "underline",
                }}
              >
                {datosEditables.nombreArchivo || "Sin archivo"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {showToast && (
        <div className="toast-exito">✅ Gasto actualizado con éxito</div>
      )}

      {/* Modal de Confirmación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este gasto?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminar}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para vista de factura */}
      <Modal
        show={showFacturaModal}
        onHide={() => setShowFacturaModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Factura Adjunta</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center" }}>
          {datosEditables.facturaBase64 ? (
            <>
              {datosEditables.nombreArchivo.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={datosEditables.facturaBase64}
                  title="Factura PDF"
                  width="100%"
                  height="500px"
                  style={{ border: "none" }}
                />
              ) : datosEditables.nombreArchivo
                  .toLowerCase()
                  .match(/\.(jpeg|jpg|png)$/) ? (
                <img
                  src={datosEditables.facturaBase64}
                  alt="Factura"
                  style={{ maxWidth: "100%", maxHeight: "500px" }}
                />
              ) : (
                <p>No se puede previsualizar este tipo de archivo.</p>
              )}
              <a
                href={datosEditables.facturaBase64}
                download={datosEditables.nombreArchivo}
                className="btn btn-primary mt-3"
              >
                Descargar Factura
              </a>
            </>
          ) : (
            <p>No hay factura adjunta.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GastoDetail;
