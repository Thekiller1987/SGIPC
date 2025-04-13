import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ProjectProvider } from './context/ProjectContext';

// Vistas
import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import ProjectDashboard from "./views/ProjectDashboard";
import ActividadesList from "./components/actividadeslist/ActividadesList";
import BudgetVisualization from "./views/BudgetVisualization";
import GastosManagement from "./views/GastosManagement";
import GastosOverview from "./views/GastosOverview";
import GastoDetail from "./views/GastoDetail";
import ProveedoresOverview from "./views/ProveedoresOverview";
import Detalleproveedor from "./views/DetalleProveedor";
import PresupuestoView from "./views/PresupuestoView";
import FormularioProveedor from "./components/Proveedores/FormularioProveedor";
import AgregarPago from "./views/AgregarPago";
import PagosListView from "./views/PagosListView";
import ProyectosOverview from "./views/ProyectosOverview";
import CreateProjectView from "./views/CreateProjectView";

const AppContent = () => {
  const location = useLocation();

  const noHeaderRoutes = [
    "/gastos-overview",
    "/proveedores",
    "/presupuesto",
    "/detalle-proveedor",
    "/AgregarPago",
    "/agregar-proveedor",
    "/listar-pagos",
    "/actividades",
    "/inicio",
    "/budget-visualization",
    "/proyecto",
    "/CrearProyecto",
    "/project-dashboard",
    "/gasto-detail"

  ];

  return (
    <>
      {!noHeaderRoutes.includes(location.pathname) && <Encabezado />}
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
          <Route path="/proyecto" element={<ProtectedRoute element={<ProyectosOverview />} />} />
          <Route path="/project-dashboard" element={<ProtectedRoute element={<ProjectDashboard />} />} />
          <Route path="/actividades" element={<ProtectedRoute element={<ActividadesList />} />} />
          <Route path="/budget-visualization" element={<ProtectedRoute element={<BudgetVisualization />} />} />
          <Route path="/gastos" element={<ProtectedRoute element={<GastosManagement />} />} />
          <Route path="/gastos-overview" element={<ProtectedRoute element={<GastosOverview />} />} />
          <Route path="/gasto-detail" element={<ProtectedRoute element={<GastoDetail />} />} />
          <Route path="/proveedores" element={<ProtectedRoute element={<ProveedoresOverview />} />} />
          <Route path="/detalle-proveedor" element={<ProtectedRoute element={<Detalleproveedor />} />} />
          <Route path="/presupuesto" element={<ProtectedRoute element={<PresupuestoView />} />} />
          <Route path="/agregar-proveedor" element={<ProtectedRoute element={<FormularioProveedor />} />} />
          <Route path="/AgregarPago" element={<ProtectedRoute element={<AgregarPago />} />} />
          <Route path="/listar-pagos" element={<ProtectedRoute element={<PagosListView />} />} />
          <Route path="/CrearProyecto" element={<ProtectedRoute element={<CreateProjectView />} />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <AppContent />
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;