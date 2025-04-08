// src/views/PagosListView.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import Sidebar from '../components/Sidebar';
import '../PagosCss/ListaPagos.css';
import { format } from 'date-fns';
import editIcon from '../assets/iconos/edit.png';
import checkIcon from '../assets/iconos/check.png';
import deleteIcon from '../assets/iconos/delete.png';

const PagosListView = () => {
  const location = useLocation();
  const { project } = location.state || {};
  const [pagos, setPagos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const navigate = useNavigate();

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

  const iniciarEdicion = (pago) => {
    setEditandoId(pago.id);
    const fechaRaw = pago.fecha?.toDate ? pago.fecha.toDate() : new Date(pago.fecha);
    setFormEdit({
      proveedorEmpleado: pago.proveedorEmpleado,
      metodoPago: pago.metodoPago,
      monto: pago.monto,
      moneda: pago.moneda || 'C$',
      fecha: format(fechaRaw, 'yyyy-MM-dd')
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({});
  };

  const guardarCambios = async (id) => {
    try {
      const ref = doc(db, 'pagos', id);
      await updateDoc(ref, {
        proveedorEmpleado: formEdit.proveedorEmpleado,
        metodoPago: formEdit.metodoPago,
        monto: parseFloat(formEdit.monto),
        moneda: formEdit.moneda,
        fecha: new Date(formEdit.fecha)
      });
      const actualizados = pagos.map(p =>
        p.id === id ? { ...p, ...formEdit, fecha: new Date(formEdit.fecha) } : p
      );
      setPagos(actualizados);
      cancelarEdicion();
    } catch (error) {
      console.error("Error actualizando pago:", error);
    }
  };

  const eliminarPago = async (id) => {
    if (confirm("¿Deseas eliminar este pago?")) {
      await deleteDoc(doc(db, 'pagos', id));
      setPagos(pagos.filter(p => p.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEdit(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="contenido-principal fondo-oscuro">
        <h1 className="titulo-modulo">Caja</h1>

        <div className="tabla-contenedor tabla-ancha">
          <h2 className="nombre-proyecto">{project?.nombre}</h2>

          <div className="scroll-tabla">
            <table className="tabla-pagos">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proveedor/Empleado</th>
                  <th>Método de pago</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => {
                  const esEditando = editandoId === pago.id;
                  const fecha = pago.fecha?.toDate ? pago.fecha.toDate() : new Date(pago.fecha);

                  return (
                    <tr key={pago.id} className={esEditando ? 'fila-seleccionada' : ''}>
                      {esEditando ? (
                        <>
                          <td><input type="date" name="fecha" value={formEdit.fecha} onChange={handleChange} className="input-editar" /></td>
                          <td><input type="text" name="proveedorEmpleado" value={formEdit.proveedorEmpleado} onChange={handleChange} className="input-editar" /></td>
                          <td>
                            <select name="metodoPago" value={formEdit.metodoPago} onChange={handleChange} className="input-editar">
                              <option value="Efectivo">Efectivo</option>
                              <option value="Transferencia">Transferencia</option>
                              <option value="Cheque">Cheque</option>
                              <option value="Tarjeta">Tarjeta</option>
                            </select>
                          </td>
                          <td>
                            <div className="monto-con-moneda">
                              <input type="number" name="monto" value={formEdit.monto} onChange={handleChange} className="input-editar" />
                              <select name="moneda" value={formEdit.moneda} onChange={handleChange} className="moneda-select">
                                <option value="C$">C$</option>
                                <option value="US$">US$</option>
                                <option value="€$">€$</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            <div className="iconos-acciones">
                              <button onClick={() => guardarCambios(pago.id)}><img src={checkIcon} alt="Guardar" /></button>
                              <button onClick={cancelarEdicion}><img src={deleteIcon} alt="Cancelar" /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{format(fecha, 'dd/MM/yyyy')}</td>
                          <td>{pago.proveedorEmpleado}</td>
                          <td>{pago.metodoPago}</td>
                          <td>{`${pago.moneda || 'C$'}${pago.monto}`}</td>
                          <td>
                            <div className="iconos-acciones">
                              <button onClick={() => iniciarEdicion(pago)}><img src={editIcon} alt="Editar" /></button>
                              <button onClick={() => eliminarPago(pago.id)}><img src={deleteIcon} alt="Eliminar" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
