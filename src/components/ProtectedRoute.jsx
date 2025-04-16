import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";

const ProtectedRoute = ({ element, roles }) => {
  const { user, userData, loadingUserData } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loadingUserData) {
    return <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>Cargando permisos...</div>;
  }

  if (!userData) {
    return <Navigate to="/no-autorizado" replace />;
  }

  if (roles && !roles.includes(userData.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return element;
};

export default ProtectedRoute;
