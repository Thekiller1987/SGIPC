import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrarPagoComoGasto } from "../services/firebasePagos";
import FormularioPago from '../components/pagos/FormularioPago';
import Sidebar from '../components/Sidebar';
import "../PagosCss/FormularioPago.css";

const AgregarPago = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project } = location.state || {};

  const handleAgregarPago = async (data) => {
    try {
      await registrarPagoComoGasto(data, project?.id);
      navigate(-1);
    } catch (error) {
      console.error('Error al guardar el pago:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="form-contenido-principal">
        <h1 className="form-titulo-modulo">Pagos</h1>
        <div className="form-pago-container">
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
