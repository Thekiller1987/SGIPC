// src/views/DetalleProveedor.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { actualizarProveedor, eliminarProveedor } from "../services/firebaseProveedores";


const DetalleProveedorView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const proveedor = location.state?.proveedor;

  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: proveedor?.nombre || "",
    empresa: proveedor?.empresa || "",
    servicios: proveedor?.servicios || "",
    telefono: proveedor?.telefono || "",
    historialPago: {
      monto: proveedor?.historialPago?.monto || "",
      fecha: proveedor?.historialPago?.fecha || "",
      estado: proveedor?.historialPago?.estado || "A tiempo"
    }
  });

  if (!proveedor) {
    return <p>Error: No se proporcionó proveedor.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("historialPago.")) {
      const campo = name.split(".")[1];
      setFormulario((prev) => ({
        ...prev,
        historialPago: {
          ...prev.historialPago,
          [campo]: value
        }
      }));
    } else {
      setFormulario((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGuardar = async () => {
    const datosActualizados = {
      ...formulario,
      historialPago: {
        monto: parseFloat(formulario.historialPago.monto),
        fecha: formulario.historialPago.fecha,
        estado: formulario.historialPago.estado
      }
    };

    await actualizarProveedor(proveedor.id, datosActualizados);
    setEditando(false);
    navigate("/proveedores");
  };

  const handleEliminar = async () => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este proveedor?");
    if (confirmar) {
      await eliminarProveedor(proveedor.id);
      navigate("/proveedores");
    }
  };

  return (
    <div className="contenedor-formulario">
      <h2 className="titulo">Detalle del Proveedor</h2>

      <div className="formulario-proveedor">
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={handleChange}
          disabled={!editando}
        />

        <label>Empresa:</label>
        <input
          type="text"
          name="empresa"
          value={formulario.empresa}
          onChange={handleChange}
          disabled={!editando}
        />

        <label>Servicios:</label>
        <input
          type="text"
          name="servicios"
          value={formulario.servicios}
          onChange={handleChange}
          disabled={!editando}
        />

        <label>Teléfono:</label>
        <input
          type="text"
          name="telefono"
          value={formulario.telefono}
          onChange={handleChange}
          disabled={!editando}
        />

        <label>Monto del último pago:</label>
        <input
          type="number"
          name="historialPago.monto"
          value={formulario.historialPago.monto}
          onChange={handleChange}
          disabled={!editando}
        />

        <label>Fecha del último pago:</label>
        <input
          type="date"
          name="historialPago.fecha"
          value={formulario.historialPago.fecha}
          onChange={handleChange}
          disabled={!editando}
        />

        <label>Estado del pago:</label>
        <select
          name="historialPago.estado"
          value={formulario.historialPago.estado}
          onChange={handleChange}
          disabled={!editando}
        >
          <option value="A tiempo">A tiempo</option>
          <option value="Atrasado">Atrasado</option>
        </select>

        <div className="botones-formulario mt-3">
          {!editando ? (
            <button className="btn-agregar" onClick={() => setEditando(true)}>
              Editar
            </button>
          ) : (
            <>
              <button className="btn-agregar" onClick={handleGuardar}>
                Guardar Cambios
              </button>
              <button className="btn-cancelar" onClick={() => setEditando(false)}>
                Cancelar Edición
              </button>
            </>
          )}
          <button className="btn-eliminar" onClick={handleEliminar}>
            Eliminar
          </button>
          <button className="btn-cancelar" onClick={() => navigate("/proveedores")}>Volver</button>
        </div>
      </div>
    </div>
  );
};

export default DetalleProveedorView;
