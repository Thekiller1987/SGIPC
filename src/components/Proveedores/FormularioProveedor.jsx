import React, { useState } from "react";
import { guardarProveedor } from "../../services/firebaseProveedores";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import "../../Proveedorcss/FormularioProveedor.css";

const FormularioProveedor = () => {
  const [formulario, setFormulario] = useState({
    nombre: "",
    empresa: "",
    servicios: "",
    telefono: "",
    historialPago: {
      monto: "",
      fecha: "",
      estado: "A tiempo",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId || localStorage.getItem("projectId");

  if (!projectId) {
    return (
      <div className="layout-proveedores">
        <Sidebar />
        <h2 className="titulo-fondo-oscuro">⚠️ Proceso inválido</h2>
        <p style={{ color: "#fff" }}>
          No se detectó el ID del proyecto. Por favor, vuelve al dashboard del proyecto
          y desde allí ingresa a proveedores.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("historialPago.")) {
      const campo = name.split(".")[1];
      setFormulario((prev) => ({
        ...prev,
        historialPago: {
          ...prev.historialPago,
          [campo]: value,
        },
      }));
    } else {
      setFormulario((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const proveedor = {
      ...formulario,
      historialPago: {
        monto: parseFloat(formulario.historialPago.monto),
        fecha: formulario.historialPago.fecha,
        estado: formulario.historialPago.estado,
      },
      proyectoId: projectId,
    };
    await guardarProveedor(proveedor);
    navigate("/proveedores", { state: { projectId } });
  };

  return (
    <div className="layout-proveedores">
      <Sidebar />
      <h1 className="titulo-fondo-oscuro">Agregar Proveedor</h1>

      <div className="proveedores-container">
        <div className="proveedor-detalle-card">
          <form onSubmit={handleSubmit} className="fila-detalle-vertical">
            <div className="campo-horizontal">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                className="input-nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-horizontal">
              <label>Empresa:</label>
              <input
                type="text"
                name="empresa"
                className="input-empresa"
                value={formulario.empresa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-horizontal">
              <label>Servicios que ofrece:</label>
              <textarea
                name="servicios"
                className="input-servicios"
                value={formulario.servicios}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-horizontal">
              <label>Contacto:</label>
              <input
                type="text"
                name="telefono"
                className="input-telefono"
                value={formulario.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-horizontal">
              <label>Monto del último pago:</label>
              <input
                type="number"
                name="historialPago.monto"
                className="input-monto"
                value={formulario.historialPago.monto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-horizontal">
              <label>Fecha del último pago:</label>
              <input
                type="date"
                name="historialPago.fecha"
                className="input-fecha"
                value={formulario.historialPago.fecha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo-horizontal">
              <label>Estado del pago:</label>
              <select
                name="historialPago.estado"
                className="input-estado"
                value={formulario.historialPago.estado}
                onChange={handleChange}
              >
                <option value="A tiempo">A tiempo</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>

            <div className="botones-formulario">
  <button type="submit" className="btn-agregar">Agregar</button>
  <button
    type="button"
    className="btn-cancelar"
    onClick={() => navigate("/proveedores", { state: { projectId } })}
  >
    Cancelar
  </button>
</div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioProveedor;
