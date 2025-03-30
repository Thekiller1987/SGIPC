// src/views/BudgetVisualization.jsx
import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { getGastos } from '../services/gastosService';

const COLORS = ['#dc6735', '#0088FE'];

// Función para renderizar etiquetas personalizadas con porcentaje
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const BudgetVisualization = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  // Estado para acumular solo gastos y para los ingresos adicionales
  const [totalGastado, setTotalGastado] = useState(0);
  const [additionalFunds, setAdditionalFunds] = useState(0);

  // Consulta las transacciones del proyecto y suma los montos según su tipo
  useEffect(() => {
    const fetchTransacciones = async () => {
      if (project?.id) {
        // Suponemos que getGastos devuelve un arreglo de transacciones 
        // donde cada transacción tiene { monto, tipo } y "tipo" puede ser 'gasto' o 'ingreso'
        const transacciones = await getGastos(project.id);
        
        // Filtramos las transacciones de tipo 'gasto' para el total gastado
        const gastos = transacciones.filter(t => t.tipo === 'gasto');
        const sumaGastos = gastos.reduce((acc, trans) => acc + Number(trans.monto || 0), 0);
        setTotalGastado(sumaGastos);

        // Filtramos las transacciones de tipo 'ingreso' para los fondos adicionales
        const ingresos = transacciones.filter(t => t.tipo === 'ingreso');
        const sumaIngresos = ingresos.reduce((acc, trans) => acc + Number(trans.monto || 0), 0);
        setAdditionalFunds(sumaIngresos);
      }
    };
    fetchTransacciones();
  }, [project]);

  // El presupuesto inicial proviene del proyecto
  const montoInicial = project && project.presupuesto ? Number(project.presupuesto) : 0;
  // El presupuesto total es el inicial + los fondos adicionales (ingresos)
  const presupuestoTotal = montoInicial + additionalFunds;
  // El saldo disponible se calcula restando los gastos del presupuesto total
  const saldoDisponible = presupuestoTotal - totalGastado;

  // Datos para el gráfico: se muestran el monto gastado y el saldo disponible
  const data = [
    { name: 'Monto Gastado', value: totalGastado },
    { name: 'Saldo Disponible', value: saldoDisponible },
  ];

  return (
    <Container className="mt-5 pt-5">
      <h1>Presupuesto del Proyecto</h1>
      <h2>{project ? project.nombre : 'Proyecto sin nombre'}</h2>
      <div style={{ marginTop: '1rem' }}>
        <p><strong>Presupuesto Inicial:</strong> ${montoInicial}</p>
        <p><strong>Fondos Adicionales:</strong> ${additionalFunds}</p>
        <p><strong>Presupuesto Total:</strong> ${presupuestoTotal}</p>
        <p><strong>Monto Gastado:</strong> ${totalGastado}</p>
        <p><strong>Saldo Disponible:</strong> ${saldoDisponible}</p>
      </div>

      {/* Botón para ir a la pantalla de Gastos */}
      {project?.id && (
        <Button
          variant="primary"
          onClick={() => navigate("/gastos", { state: { projectId: project.id,projectName: project.nombre } })}
          className="mb-3"
        >
          Agregar / Ver Gastos
        </Button>
      )}

      <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={100} 
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Container>
  );
};

export default BudgetVisualization;
