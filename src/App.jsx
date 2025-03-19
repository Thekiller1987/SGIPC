import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Projects from "./views/Projects"; // Donde se muestra el ProjectsList y ProjectForm
import ProjectDashboard from "./views/ProjectDashboard"; // Nuevo dashboard

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Encabezado />
          <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
              <Route path="/projects" element={<ProtectedRoute element={<Projects />} />} />
              <Route path="/project-dashboard" element={<ProtectedRoute element={<ProjectDashboard />} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
