import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import { updateGasto } from "../services/gastosService";
import "../GastosCss/GastoDetail.css";
import editIcon from "../assets/iconos/edit.png";
import checkIcon from "../assets/iconos/check.png";
import deleteIcon from "../assets/iconos/delete.png";

// Función para formatear la fecha al formato YYYY-MM-DD
const formatFechaParaInput = (fecha) => {
  if (typeof fecha === "string") return fecha;
  const date = fecha?.toDate ? fecha.toDate() : new Date(fecha);
  return date.toISOString().split("T")[0];
};

const GastoDetail = () => {
  const location = useLocation();
  const { gasto, projectId, projectName } = location.state || {};

  const [modoEdicion, setModoEdicion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errores, setErrores] = useState({});
  const [datosEditables, setDatosEditables] = useState({
    categoria: gasto.categoria || "",
    fecha: formatFechaParaInput(gasto.fecha),
    monto: gasto.monto || "",
    facturaBase64: gasto.facturaBase64 || "",
    nombreArchivo: gasto.nombreArchivo || "",
  });

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
    if (!datosEditables.categoria.trim()) nuevosErrores.categoria = "Este campo es requerido";
    if (!datosEditables.fecha.trim()) nuevosErrores.fecha = "Este campo es requerido";
    if (!datosEditables.monto.toString().trim()) nuevosErrores.monto = "Este campo es requerido";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarCampos()) return;
    try {
      await updateGasto(gasto.id, {
        ...datosEditables,
        fecha: datosEditables.fecha,
      });
      setModoEdicion(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
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
              {modoEdicion ? (
                <div className="dg-icono" onClick={handleGuardar}>
                  <img src={checkIcon} alt="Guardar" />
                </div>
              ) : (
                <div className="dg-icono" onClick={() => setModoEdicion(true)}>
                  <img src={editIcon} alt="Editar" />
                </div>
              )}
              <div className="dg-icono">
                <img src={deleteIcon} alt="Eliminar" />
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div className="dg-campo">
            <label>Categoría de Gasto :</label>
            {modoEdicion ? (
              <div className="dg-campo-col">
                <input
                  name="categoria"
                  list="categorias"
                  className="dg-input"
                  value={datosEditables.categoria}
                  onChange={handleChange}
                  placeholder="Seleccione o escriba..."
                />
                <datalist id="categorias">
                  <option value="Materiales" />
                  <option value="Mano de obra" />
                  <option value="Transporte" />
                </datalist>
                {errores.categoria && <div className="dg-error">{errores.categoria}</div>}
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
            <div className="dg-campo-col">
              <input
                type="number"
                name="monto"
                className="dg-input"
                value={datosEditables.monto}
                onChange={handleChange}
                disabled={!modoEdicion}
              />
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
              <span className="dg-factura-nombre">
                {datosEditables.nombreArchivo || "Sin archivo"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {showToast && <div className="toast-exito">✅ Gasto actualizado con éxito</div>}
    </div>
  );
};

export default GastoDetail;
