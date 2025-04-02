import React, { useState } from "react";
import { guardarProveedor } from "../../services/firebaseProveedores";
import { useNavigate, useLocation } from "react-router-dom";

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
      <div className="contenedor-formulario">
        <h2 className="titulo">⚠️ Proceso inválido</h2>
        <p>
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
    <div className="contenedor-formulario">
      <h2 className="titulo">Agregar Proveedor</h2>

      <form onSubmit={handleSubmit} className="formulario-proveedor">
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={handleChange}
          required
        />

        <label>Empresa:</label>
        <input
          type="text"
          name="empresa"
          value={formulario.empresa}
          onChange={handleChange}
          required
        />

        <label>Servicios que ofrece:</label>
        <input
          type="text"
          name="servicios"
          value={formulario.servicios}
          onChange={handleChange}
          required
        />

        <label>Contacto:</label>
        <input
          type="text"
          name="telefono"
          value={formulario.telefono}
          onChange={handleChange}
          required
        />

        <hr />
        <h5>Historial de pagos</h5>

        <label>Monto del último pago:</label>
        <input
          type="number"
          name="historialPago.monto"
          value={formulario.historialPago.monto}
          onChange={handleChange}
          required
        />

        <label>Fecha del último pago:</label>
        <input
          type="date"
          name="historialPago.fecha"
          value={formulario.historialPago.fecha}
          onChange={handleChange}
          required
        />

        <label>Estado del pago:</label>
        <select
          name="historialPago.estado"
          value={formulario.historialPago.estado}
          onChange={handleChange}
        >
          <option value="A tiempo">A tiempo</option>
          <option value="Atrasado">Atrasado</option>
        </select>

        <div className="botones-formulario mt-3">
          <button type="submit" className="btn-agregar">
            Agregar
          </button>
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
  );
};

export default FormularioProveedor;
