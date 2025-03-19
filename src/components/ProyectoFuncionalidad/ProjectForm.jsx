// src/components/ProyectoFuncionalidad/ProjectForm.jsx
import React, { useState, useRef } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { createProject } from "../../services/projectsService";

// Función auxiliar para convertir un archivo en Base64
const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const ProjectForm = ({ onProjectCreated }) => {
  // Estados para los campos
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cliente, setCliente] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [estado, setEstado] = useState("En progreso");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [files, setFiles] = useState([]);  
  const [error, setError] = useState(null);

  // 1. Creamos la referencia para el input de archivos
  const fileInputRef = useRef(null);

  // Convierte todos los archivos seleccionados a Base64 y los almacena en `files`
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
      // Armamos el objeto con los campos del proyecto
      const projectData = {
        nombre,
        descripcion,
        cliente,
        presupuesto: Number(presupuesto),
        estado,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
      };

      // Creamos el proyecto en Firestore, enviando también los archivos en Base64
      const projectId = await createProject(projectData, files);

      // Si se creó el proyecto con éxito y tenemos un callback, lo llamamos
      if (onProjectCreated) onProjectCreated(projectId);

      // Limpieza de campos
      setNombre("");
      setDescripcion("");
      setCliente("");
      setPresupuesto("");
      setEstado("En progreso");
      setFechaInicio("");
      setFechaFin("");
      setFiles([]);
      setError(null);

      // 2. Limpieza manual del input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Error al crear proyecto:", err);
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
        {/* 3. Referencia para poder limpiar manualmente el valor del input */}
        <Form.Control
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Crear Proyecto
      </Button>
    </Form>
  );
};

export default ProjectForm;
