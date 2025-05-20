// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";

const ProtectedRoute = ({ element, roles }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return null; // 👈 importante: espera antes de tomar decisiones

  if (!user) return <Navigate to="/" replace />;
  if (!userData) return null;

  const userRole = userData.rol;

  return roles.includes(userRole) ? element : <Navigate to="/no-autorizado" replace />;
};

export default ProtectedRoute;
