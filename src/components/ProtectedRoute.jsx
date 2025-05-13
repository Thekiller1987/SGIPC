// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";

const ProtectedRoute = ({ element, roles }) => {
  const { user, userData } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (!userData) return null; // espera a que se cargue

  const userRole = userData.rol;

  // Validar si el rol actual está permitido
  return roles.includes(userRole) ? element : <Navigate to="/no-autorizado" replace />;
};

export default ProtectedRoute;
