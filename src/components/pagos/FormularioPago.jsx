import React, { useState, useEffect } from "react";
import "../../PagosCss/FormularioPago.css";
import { obtenerProveedores } from "../../services/firebaseProveedores";

const FormularioPago = ({ onSubmit, nombreProyecto, projectId }) => {
  const [proveedorEmpleado, setProveedorEmpleado] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("C$");
  const [fecha, setFecha] = useState("");
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const lista = await obtenerProveedores(projectId);
        setProveedores(lista);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
      }
    };

    if (projectId) cargarProveedores();
  }, [projectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const [year, month, day] = fecha.split("-");
    const fechaLocal = new Date(year, month - 1, day);

    onSubmit({
      proveedorEmpleado,
      metodoPago,
      monto,
      moneda,
      fecha: fechaLocal, // ⬅️ esta fecha se guarda como la del gasto
    });
  };

  return (
    <form className="formulario-pago" onSubmit={handleSubmit}>
      <h3 className="form-nombre-proyecto">{nombreProyecto || "Proyecto Sin Nombre"}</h3>

      <label>Proveedor/Empleado:</label>
      <input
        list="proveedores"
        value={proveedorEmpleado}
        onChange={(e) => setProveedorEmpleado(e.target.value)}
      />
      <datalist id="proveedores">
        {proveedores.map((p) => (
          <option key={p.id} value={p.nombre} />
        ))}
      </datalist>

      <label>Método de pago:</label>
      <select
        value={metodoPago}
        onChange={(e) => setMetodoPago(e.target.value)}
        className="form-select-input"
      >
        <option value="">Seleccione un método</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Cheque">Cheque</option>
        <option value="Tarjeta">Tarjeta</option>
      </select>

      <label>Monto:</label>
      <div className="form-monto-con-moneda">
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <select
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
          className="form-moneda-select"
        >
          <option value="C$">C$</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      <label>Fecha:</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <div className="form-botones-derecha">
        <button type="submit" className="form-btn-agregar">
          Agregar Pago
        </button>
      </div>
    </form>
  );
};

export default FormularioPago;
