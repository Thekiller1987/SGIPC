import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { actualizarProveedor, eliminarProveedor } from "../services/firebaseProveedores";
import { doc, updateDoc } from "firebase/firestore"; // Asegúrate de importar desde Firestore
import Sidebar from "../components/Sidebar";
import editIcon from "../assets/iconos/edit.png";
import checkIcon from "../assets/iconos/check.png";
import deleteIcon from "../assets/iconos/delete.png";
import closeIcon from "../assets/iconos/close.png";
import "../Proveedorcss/ProveedorDetalle.css";

const DetalleProveedorView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proveedor = location.state?.proveedor;

  const [editando, setEditando] = useState(false);
  const [showToast, setShowToast] = useState(false); // ✅ Toast de éxito
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
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // 🌐 estado de conexión

  if (!proveedor) return <p>Error: No se proporcionó proveedor.</p>;

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
    setShowToast(true); // ✅ Mostrar toast
    setTimeout(() => setShowToast(false), 3000); // ✅ Ocultar toast después de 3s
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      await eliminarProveedor(proveedor.id);
      navigate("/proveedores");
    }
  };

  // Función para editar  proveedor
  const handleEditCategoria = async () => {
    if (!formulario.nombre || !formulario.empresa) {
      alert("Por favor, completa todos los campos antes de actualizar.");
      return;
    }

    setEditando(false);

    const proveedorRef = doc(db, "proveedores", proveedor.id);
  
    try {
      // Intentar actualizar en Firestore
      await updateDoc(proveedorRef, {
        nombre: formulario.nombre,
        empresa: formulario.empresa,
        servicios: formulario.servicios,
        telefono: formulario.telefono,
        historialPago: formulario.historialPago
      });

      console.log('Red desconectada:', isOffline )
  
      if (isOffline) {
        // Actualizar estado local inmediatamente si no hay conexión
        setFormulario({ ...formulario });
        console.log("Proveedor actualizado localmente (sin conexión).");
        alert(
          "Sin conexión: Proveedor actualizado localmente. Se sincronizará cuando haya internet."
        );
      } else {
        // Si hay conexión, confirmar éxito en la nube
        console.log("Proveedor actualizado exitosamente en la nube.");
      }
    } catch (error) {
      // Manejar errores inesperados (no relacionados con la red)
      console.error("Error al actualizar el proveedor:", error);
      setFormulario({ ...formulario });
      alert("Ocurrió un error al actualizar el proveedor: " + error.message);
    }
  };

  return (
    <div className="layout-proveedores">
      <Sidebar />
      <h1 className="titulo-fondo-oscuro">Proveedores</h1>

      <div className="proveedores-container">
        <div className="proveedor-detalle-card">
          <div className="encabezado-detalle">
            <h2 className="titulo-proyecto">{formulario.empresa}</h2>
            <div className="botones-superiores">
              <button onClick={() => (editando ? handleGuardar() : setEditando(true))}>
                <img src={editando ? checkIcon : editIcon} alt="Editar" />
              </button>
              <button onClick={handleEliminar}>
                <img src={deleteIcon} alt="Eliminar" />
              </button>
              <button onClick={() => navigate("/proveedores")}>
                <img src={closeIcon} alt="Volver" />
              </button>
            </div>
          </div>

          <div className="fila-detalle-vertical">
            <div className="campo-horizontal">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                className="input-nombre"
                value={formulario.nombre}
                onChange={handleChange}
                disabled={!editando}
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
                disabled={!editando}
              />
            </div>

            <div className="campo-horizontal">
              <label>Servicios que ofrece:</label>
              <textarea
                name="servicios"
                className="input-servicios"
                value={formulario.servicios}
                onChange={handleChange}
                disabled={!editando}
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
                disabled={!editando}
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
                disabled={!editando}
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
                disabled={!editando}
              />
            </div>

            <div className="campo-horizontal">
              <label>Estado del pago:</label>
              <select
                name="historialPago.estado"
                className="input-estado"
                value={formulario.historialPago.estado}
                onChange={handleChange}
                disabled={!editando}
              >
                <option value="A tiempo">A tiempo</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Toast de éxito */}
      {showToast && (
        <div className="toast-exito-proveedor">
          ✅ Proveedor actualizado con éxito
        </div>
      )}
    </div>
  );
};

export default DetalleProveedorView;
