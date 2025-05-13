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
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [offline, setOffline] = useState(false);

  const tasasCambio = {
    USD: 37,
    EUR: 40.77,
    NIO: 1
  };

  const convertirAMonedaLocal = (monto, moneda) => {
    const tasa = tasasCambio[moneda] || 1;
    return Number(monto) * tasa;
  };

  useEffect(() => {
    const fetchTransacciones = async () => {
      if (!project?.id) return;

      try {
        const transacciones = await getGastos(project.id);

        const gastos = transacciones.filter(t => t.tipo === 'gasto');
        const ingresos = transacciones.filter(t => t.tipo === 'ingreso');

        const sumaGastos = gastos.reduce((acc, trans) => {
          const montoCordobas = convertirAMonedaLocal(trans.monto || 0, trans.moneda || 'NIO');
          return acc + montoCordobas;
        }, 0);

        const sumaIngresos = ingresos.reduce((acc, trans) => {
          const montoCordobas = convertirAMonedaLocal(trans.monto || 0, trans.moneda || 'NIO');
          return acc + montoCordobas;
        }, 0);

        setTotalGastado(sumaGastos);
        setTotalIngresos(sumaIngresos);
      } catch (error) {
        console.error("Error obteniendo datos de gastos:", error);
        if (!navigator.onLine) {
          setOffline(true);
        }
      }
    };

    fetchTransacciones();
  }, [project]);

  const montoInicial = project?.presupuesto ? Number(project.presupuesto) : 0;
  const presupuestoTotal = montoInicial + totalIngresos;
  const saldoDisponible = presupuestoTotal - totalGastado;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="contenido-principal">
        <h1 className="titulo-modulo-izquierda">Presupuesto del Proyecto</h1>

        {offline && (
          <div style={{ color: 'orange', marginBottom: '10px' }}>
            ⚠ Estás sin conexión. Mostrando datos desde la caché local (si están disponibles).
          </div>
        )}

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
              <div className="presupuesto-box">C${montoInicial.toLocaleString()}</div>
            </div>

            <div>
              <p className="presupuesto-label">Ingresos Adicionales:</p>
              <div className="presupuesto-box">C${totalIngresos.toLocaleString()}</div>
            </div>

            <div>
              <p className="presupuesto-label">Monto Gastado:</p>
              <div className="presupuesto-box">C${totalGastado.toLocaleString()}</div>
            </div>
          </div>

          <div className="presupuesto-saldo">
            <p className="presupuesto-label">Saldo Disponible:</p>
            <div className="presupuesto-box">C${saldoDisponible.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetVisualization;
