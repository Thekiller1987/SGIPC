// src/components/Pagos/FormularioPago.jsx
import React, { useState, useEffect } from 'react';
import '../../PagosCss/FormularioPago.css';
import { obtenerProveedores } from '../../services/firebaseProveedores';

const FormularioPago = ({ onSubmit, nombreProyecto, projectId }) => {
  const [proveedorEmpleado, setProveedorEmpleado] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('C$');
  const [fecha, setFecha] = useState('');
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const lista = await obtenerProveedores(projectId);
        setProveedores(lista);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };

    if (projectId) cargarProveedores();
  }, [projectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ proveedorEmpleado, metodoPago, monto, moneda, fecha });
  };

  return (
    <div className="formulario-pago">
      <h3 className="nombre-proyecto">{nombreProyecto || 'Proyecto'}</h3>

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
        className="select-input"
      >
        <option value="">Seleccione un método</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Cheque">Cheque</option>
        <option value="Tarjeta">Tarjeta</option>
      </select>

      <label>Monto:</label>
      <div className="monto-con-moneda">
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <select
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
          className="moneda-select"
        >
          <option value="C$">C$</option>
          <option value="US$">US$</option>
          <option value="US$">€$</option>
        </select>
      </div>

      <label>Fecha:</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <button className="btn-agregar" onClick={handleSubmit}>
        Agregar
      </button>
    </div>
  );
};

export default FormularioPago;
