// src/views/AgregarPago.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from "../database/firebaseconfig";
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import FormularioPago from '../components/pagos/FormularioPago';
import Sidebar from '../components/Sidebar';

const AgregarPago = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state || {};
  console.log("Proyecto recibido:", project);

  const handleAgregarPago = async (data) => {
    try {
      await addDoc(collection(db, 'pagos'), {
        projectId: project.id,
        proveedorEmpleado: data.proveedorEmpleado,
        metodoPago: data.metodoPago,
        monto: parseFloat(data.monto),
        moneda: data.moneda, // 👈 añadimos la moneda
        fecha: Timestamp.fromDate(new Date(data.fecha)),
        creado: Timestamp.now()
      });
      navigate(-1);
    } catch (error) {
      console.error('Error al guardar el pago:', error);
    }
  };
  

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="contenido-principal">
        <h1 className="titulo-modulo">Pagos</h1>

        <div className="pago-container">
          <FormularioPago
            onSubmit={handleAgregarPago}
            nombreProyecto={project?.nombre}
            projectId={project?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default AgregarPago;
