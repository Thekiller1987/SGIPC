import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getGastos } from '../services/gastosService';
import Sidebar from '../components/Sidebar';
import '../PresupuestoProyectoCss/PresupuestoProyecto.css';

const BudgetVisualization = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;

  const [totalGastado, setTotalGastado] = useState(0);
  const [additionalFunds, setAdditionalFunds] = useState(0);

  useEffect(() => {
    const fetchTransacciones = async () => {
      if (project?.id) {
        const transacciones = await getGastos(project.id);
        const gastos = transacciones.filter(t => t.tipo === 'gasto');
        const sumaGastos = gastos.reduce((acc, trans) => acc + Number(trans.monto || 0), 0);
        setTotalGastado(sumaGastos);

        const ingresos = transacciones.filter(t => t.tipo === 'ingreso');
        const sumaIngresos = ingresos.reduce((acc, trans) => acc + Number(trans.monto || 0), 0);
        setAdditionalFunds(sumaIngresos);
      }
    };
    fetchTransacciones();
  }, [project]);

  const montoInicial = project?.presupuesto ? Number(project.presupuesto) : 0;
  const presupuestoTotal = montoInicial + additionalFunds;
  const saldoDisponible = presupuestoTotal - totalGastado;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="contenido-principal">
        <h1 className="titulo-modulo-izquierda">Presupuesto del Proyecto</h1>

        <div className="presupuesto-card">
          <div className="nombre-y-botones">
            <span className="nombre-proyecto">{project?.nombre || 'Proyecto sin nombre'}</span>
            <div className="botones-superiores">
              <button 
                className="btn-naranja" 
                onClick={() => navigate('/gastos-overview', { state: { projectId: project.id } })}
              >
                Gastos
              </button>
              <button 
                className="btn-naranja" 
                onClick={() => navigate('/gastos', { state: { projectId: project.id } })}
              >
                Gastos +
              </button>
            </div>
          </div>

          <div className="presupuesto-datos">
            <div>
              <p className="presupuesto-label">Monto Inicial :</p>
              <div className="presupuesto-box">${montoInicial.toLocaleString()}</div>
            </div>

            <div>
              <p className="presupuesto-label">Monto Gastado:</p>
              <div className="presupuesto-box">${totalGastado.toLocaleString()}</div>
            </div>
          </div>

          <div className="presupuesto-saldo">
            <p className="presupuesto-label">Saldo Disponible:</p>
            <div className="presupuesto-box">${saldoDisponible.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetVisualization;
