import React from "react";
import { useLocation } from "react-router-dom";
import ProveedoresCrud from "../components/Proveedores/Proveedores";

const Proveedores = () => {
  const location = useLocation();
  const project = location.state?.project;

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4">
        {project ? `Proveedores del Proyecto: ${project.nombre}` : "Proveedores"}
      </h2>

      {/* CRUD completo de proveedores */}
      <ProveedoresCrud project={project} />
    </div>
  );
};

export default Proveedores;
