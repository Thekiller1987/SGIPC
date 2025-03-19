// src/components/ProjectForm.jsx
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { createProject } from "../../services/projectsService";

// Función auxiliar para convertir un archivo en Base64
const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Esto genera la cadena Base64
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const ProjectForm = ({ onProjectCreated }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cliente, setCliente] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [estado, setEstado] = useState("En progreso");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [files, setFiles] = useState([]);  // Aquí guardamos los strings Base64
  const [error, setError] = useState(null);

  // Lee todos los archivos seleccionados y los convierte a Base64
  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files;
    const promises = [];
    for (const file of selectedFiles) {
      promises.push(toBase64(file));
    }
    try {
      const base64Files = await Promise.all(promises);
      setFiles(base64Files); // Guarda un array de strings Base64
    } catch (err) {
      console.error("Error al convertir archivos a Base64:", err);
      setError("Ocurrió un error al procesar los archivos.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        nombre,
        descripcion,
        cliente,
        presupuesto: Number(presupuesto),
        estado,
        // Convertimos a Date para que Firestore lo guarde correctamente
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
      };
      // ¡Importante! Se envía el array de archivos Base64 como segundo parámetro
      const projectId = await createProject(projectData, files);
      if (onProjectCreated) onProjectCreated(projectId);

      // Limpiar campos
      setNombre("");
      setDescripcion("");
      setCliente("");
      setPresupuesto("");
      setEstado("En progreso");
      setFechaInicio("");
      setFechaFin("");
      setFiles([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group controlId="nombre" className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="descripcion" className="mb-3">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="cliente" className="mb-3">
        <Form.Label>Cliente</Form.Label>
        <Form.Control
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="presupuesto" className="mb-3">
        <Form.Label>Presupuesto</Form.Label>
        <Form.Control
          type="number"
          value={presupuesto}
          onChange={(e) => setPresupuesto(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="estado" className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control
          as="select"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option>En progreso</option>
          <option>Finalizado</option>
          <option>Cancelado</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="fechaInicio" className="mb-3">
        <Form.Label>Fecha de Inicio</Form.Label>
        <Form.Control
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="fechaFin" className="mb-3">
        <Form.Label>Fecha de Fin</Form.Label>
        <Form.Control
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="documentos" className="mb-3">
        <Form.Label>Documentos (Adjuntar archivos)</Form.Label>
        <Form.Control type="file" multiple onChange={handleFileChange} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Crear Proyecto
      </Button>
    </Form>
  );
};

export default ProjectForm;
