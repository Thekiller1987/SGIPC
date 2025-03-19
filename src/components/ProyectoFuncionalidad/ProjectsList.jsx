// src/components/ProjectsList.jsx
import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { getProjects, deleteProject } from "../../services/projectsService";

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    try {
      await deleteProject(projectId);
      fetchProjects();
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
    }
  };

  return (
    <div>
      <h2>Proyectos</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cliente</th>
            <th>Presupuesto</th>
            <th>Estado</th>
            <th>Fecha de Inicio</th>
            <th>Fecha de Fin</th>
            <th>Documentos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.nombre}</td>
              <td>{project.descripcion}</td>
              <td>{project.cliente}</td>
              <td>{project.presupuesto}</td>
              <td>{project.estado}</td>
              <td>
                {project.fechaInicio &&
                  new Date(project.fechaInicio.seconds * 1000).toLocaleDateString()}
              </td>
              <td>
                {project.fechaFin &&
                  new Date(project.fechaFin.seconds * 1000).toLocaleDateString()}
              </td>
              <td>
                {project.documentos && project.documentos.length > 0 ? (
                  project.documentos.map((doc, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                      <img
                        src={doc}
                        alt={`Documento ${index + 1}`}
                        style={{ width: "150px", border: "1px solid #ccc" }}
                      />
                    </div>
                  ))
                ) : (
                  <span>No hay documentos</span>
                )}
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(project.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjectsList;
