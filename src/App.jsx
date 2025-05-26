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
import GestionUsuariosView from "./views/GestionUsuariosView";
import RegistrarUsuario from "./components/usuarios/RegistrarUsuario";
import ListaUsuarios from "./components/usuarios/ListaUsuarios";
import NoAutorizado from "./views/NoAutorizado";
import DocumentosYPlanosView from "./views/DocumentosYPlanosView";
import ArchivosOverview from "./views/ArchivosOverview";
import KPIDashboard from "./components/estadisticas/KPIDashboard"
import ResumenGastosView from "./views/ResumenGastosView";

const AppContent = () => {
  const location = useLocation();

  const noHeaderRoutes = [
    "/",
    "/gastos-overview",
    "/proveedores",
    "/presupuesto",
    "/detalle-proveedor",
    "/AgregarPago",
    "/agregar-proveedor",
    "/listar-pagos",
    "/inicio",
    "/budget-visualization",
    "/proyecto",
    "/CrearProyecto",
    "/project-dashboard",
    "/gastos",
    "/gasto-detail",
    "/gestion-usuarios",
    "/registrar-usuario",
    "/lista-usuarios",
    "/no-autorizado",
    "/Documentos",
    "/listar-archivos",
"/actividades",
    "/kpi-dashboard",
    "/resumen-gastos"

  ];

  return (
    <>
      {!noHeaderRoutes.includes(location.pathname) && <Encabezado />}
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Rutas con control por rols */}
          <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} roles={["administrador", "contador", "ingeniero", "lector"]} />} />
          <Route path="/proyecto" element={<ProtectedRoute element={<ProyectosOverview />} roles={["administrador", "contador", "ingeniero", "lector"]} />} />
          <Route path="/project-dashboard" element={<ProtectedRoute element={<ProjectDashboard />} roles={["administrador", "contador", "ingeniero", "lector"]} />} />
          <Route path="/actividades" element={<ProtectedRoute element={<ActividadesList />} roles={["administrador", "ingeniero", "lector"]} />} />
          <Route path="/budget-visualization" element={<ProtectedRoute element={<BudgetVisualization />} roles={["administrador"]} />} />
          <Route path="/gastos" element={<ProtectedRoute element={<GastosManagement />} roles={["administrador"]} />} />
          <Route path="/gastos-overview" element={<ProtectedRoute element={<GastosOverview />} roles={["administrador"]} />} />
          <Route path="/gasto-detail" element={<ProtectedRoute element={<GastoDetail />} roles={["administrador"]} />} />
          <Route path="/proveedores" element={<ProtectedRoute element={<ProveedoresOverview />} roles={["administrador"]} />} />
          <Route path="/detalle-proveedor" element={<ProtectedRoute element={<Detalleproveedor />} roles={["administrador"]} />} />
          <Route path="/presupuesto" element={<ProtectedRoute element={<PresupuestoView />} roles={["administrador", "ingeniero"]} />} />
          <Route path="/agregar-proveedor" element={<ProtectedRoute element={<FormularioProveedor />} roles={["administrador"]} />} />
          <Route path="/AgregarPago" element={<ProtectedRoute element={<AgregarPago />} roles={["administrador", "contador"]} />} />
          <Route path="/listar-pagos" element={<ProtectedRoute element={<PagosListView />} roles={["administrador", "contador"]} />} />
          <Route path="/CrearProyecto" element={<ProtectedRoute element={<CreateProjectView />} roles={["administrador"]} />} />
          <Route path="/gestion-usuarios" element={<ProtectedRoute element={<GestionUsuariosView />} roles={["administrador"]} />} />
          <Route path="/registrar-usuario" element={<ProtectedRoute element={<RegistrarUsuario />} roles={["administrador"]} />} />
          <Route path="/lista-usuarios" element={<ProtectedRoute element={<ListaUsuarios />} roles={["administrador"]} />} />
          <Route path="/Documentos" element={<ProtectedRoute element={<DocumentosYPlanosView />} roles={["administrador"]} />} />
          <Route path="/listar-archivos" element={<ProtectedRoute element={<ArchivosOverview />} roles={["administrador"]} />} />
          <Route path="/kpi-dashboard" element={<ProtectedRoute element={<KPIDashboard />} roles={["administrador"]} />}/>
          <Route path="/resumen-gastos" element={<ProtectedRoute element={<ResumenGastosView />} roles={["administrador"]} />} />

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
