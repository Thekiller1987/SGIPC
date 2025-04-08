// src/views/PagosListView.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import Sidebar from '../components/Sidebar';
import '../PagosCss/ListaPagos.css';
import { format } from 'date-fns';

const PagosListView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state || {};
  const [pagos, setPagos] = useState([]);
  const [selectedPago, setSelectedPago] = useState(null);

  useEffect(() => {
    const fetchPagos = async () => {
      if (project?.id) {
        const q = query(collection(db, 'pagos'), where('projectId', '==', project.id));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPagos(data);
      }
    };

    fetchPagos();
  }, [project]);

  const eliminarPago = async () => {
    if (!selectedPago) {
      alert("Primero selecciona un pago.");
      return;
    }

    const confirmacion = confirm("¿Deseas eliminar este pago?");
    if (confirmacion) {
      await deleteDoc(doc(db, 'pagos', selectedPago.id));
      setPagos(prev => prev.filter(p => p.id !== selectedPago.id));
      setSelectedPago(null);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="contenido-principal fondo-oscuro">
        <h1 className="titulo-modulo">Caja</h1>

        <div className="tabla-contenedor tabla-angosta">
          <h2 className="nombre-proyecto">{project?.nombre}</h2>
          <table className="tabla-pagos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor/Empleado</th>
                <th>Método de pago</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map(pago => (
                <tr
                  key={pago.id}
                  className={selectedPago?.id === pago.id ? 'fila-seleccionada' : ''}
                  onClick={() => setSelectedPago(pago)}
                >
                  <td>{format(pago.fecha.toDate(), 'dd/MM/yyyy')}</td>
                  <td>{pago.proveedorEmpleado}</td>
                  <td>{pago.metodoPago}</td>
                  <td>{`${pago.moneda || 'C$'}${pago.monto}`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="acciones-tabla">
            <button
              className="btn-tabla editar"
              onClick={() => {
                if (!selectedPago) return alert("Primero selecciona un pago.");
                navigate('/editar-pago', { state: { pago: selectedPago, project } });
              }}
            >
              ✏️ Editar
            </button>
            <button
              className="btn-tabla eliminar"
              onClick={eliminarPago}
            >
              🗑️ Eliminar
            </button>
          </div>

          <button
            className="btn-flotante"
            onClick={() => navigate('/AgregarPago', { state: { project } })}
          >
            Pagos +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagosListView;
