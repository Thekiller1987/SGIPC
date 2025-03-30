// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Projects from "./views/Projects";
import ProjectDashboard from "./views/ProjectDashboard";
import ActividadesList from "./components/actividadeslist/ActividadesList";
import BudgetVisualization from "./views/BudgetVisualization";
import GastosManagement from "./views/GastosManagement";
import GastosListView from "./views/GastosListView";
import GastosOverview from "./views/GastosOverview";
import GastoDetail from "./views/GastoDetail";

const AppContent = () => {
  const location = useLocation();
  // Define las rutas donde NO quieres el header
  const noHeaderRoutes = ["/gastos-overview"];
  return (
    <>
      {!noHeaderRoutes.includes(location.pathname) && <Encabezado />}
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
          <Route path="/projects" element={<ProtectedRoute element={<Projects />} />} />
          <Route path="/project-dashboard" element={<ProtectedRoute element={<ProjectDashboard />} />} />
          <Route path="/actividades" element={<ProtectedRoute element={<ActividadesList />} />} />
          <Route path="/budget-visualization" element={<ProtectedRoute element={<BudgetVisualization />} />} />
          <Route path="/gastos" element={<ProtectedRoute element={<GastosManagement />} />} />
          <Route path="/GastosListView" element={<ProtectedRoute element={<GastosListView />} />} />
          <Route path="/gastos-overview" element={<ProtectedRoute element={<GastosOverview />} />} />
          <Route path="/gasto-detail" element={<ProtectedRoute element={<GastoDetail />} />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
