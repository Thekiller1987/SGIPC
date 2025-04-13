import React, { useState } from "react";
import "../../ProveedoresCss/CrearProyecto.css";
import { createProject } from "../../services/projectsService";
import { useNavigate } from "react-router-dom";

const ProjectForm = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cliente, setCliente] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [estado, setEstado] = useState("En progreso");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errores, setErrores] = useState({});

  const navigate = useNavigate();

  const validar = () => {
    const nuevosErrores = {};
    if (!nombre.trim()) nuevosErrores.nombre = "Campo requerido";
    if (!descripcion.trim()) nuevosErrores.descripcion = "Campo requerido";
    if (!cliente.trim()) nuevosErrores.cliente = "Campo requerido";
    if (!presupuesto || isNaN(presupuesto) || Number(presupuesto) < 0)
      nuevosErrores.presupuesto = "Debe ser un número positivo";
    if (!fechaInicio) nuevosErrores.fechaInicio = "Seleccione una fecha";
    if (!fechaFin) nuevosErrores.fechaFin = "Seleccione una fecha";
    return nuevosErrores;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
  
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width *= scale;
            height *= scale;
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
  
    try {
      let base64Image = null;
  
      if (imagen) {
        base64Image = await compressImage(imagen);
  
        // Validación: si supera 1MB, mostrar error
        const base64Length = base64Image.length * (3/4); // Estimación real del tamaño
        if (base64Length > 1048487) {
          alert("La imagen sigue siendo muy grande después de la compresión. Intente con otra imagen más liviana.");
          return;
        }
      }
  
      const projectData = {
        nombre,
        descripcion,
        cliente,
        presupuesto: Number(presupuesto),
        estado,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        imagen: base64Image,
      };
  
      await createProject(projectData);
      navigate("/proyecto");
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    }
  };
  

  return (
    <div className="crear-proyecto-container">
      <div className="header-proyecto">
        <h2 className="titulo-crear">Crear Proyecto</h2>
        <button type="submit" className="btn-agregar-proyecto" onClick={handleSubmit}>
          Agregar
        </button>
      </div>

      <form className="formulario-proyecto" onSubmit={handleSubmit}>
        <div className="fila-formulario">
          <label>Nombre del Proyecto:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errores.nombre && <span className="error-texto">{errores.nombre}</span>}
        </div>

        <div className="fila-formulario">
          <label>Descripción:</label>
          <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          {errores.descripcion && <span className="error-texto">{errores.descripcion}</span>}
        </div>

        <div className="fila-formulario">
          <label>Cliente:</label>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          {errores.cliente && <span className="error-texto">{errores.cliente}</span>}
        </div>

        <div className="fila-formulario">
          <label>Presupuesto:</label>
          <input type="number" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} />
          {errores.presupuesto && <span className="error-texto">{errores.presupuesto}</span>}
        </div>

        <div className="fila-formulario">
          <label>Estado:</label>
          <div className="fila-estados">
            <label>
              <input type="radio" value="En progreso" checked={estado === "En progreso"} onChange={(e) => setEstado(e.target.value)} /> En Progreso
            </label>
            <label>
              <input type="radio" value="Finalizado" checked={estado === "Finalizado"} onChange={(e) => setEstado(e.target.value)} /> Finalizado
            </label>
            <label>
              <input type="radio" value="Cancelado" checked={estado === "Cancelado"} onChange={(e) => setEstado(e.target.value)} /> Cancelado
            </label>
          </div>
        </div>

        <div className="fila-fechas">
          <div className="campo-fecha">
            <label>Fecha in:</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            {errores.fechaInicio && <span className="error-texto">{errores.fechaInicio}</span>}
          </div>
          <div className="campo-fecha">
            <label>Fecha fin:</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            {errores.fechaFin && <span className="error-texto">{errores.fechaFin}</span>}
          </div>
        </div>

        <div className="fila-formulario">
          <label>Imagen del proyecto (opcional):</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {errores.imagen && <span className="error-texto">{errores.imagen}</span>}
          {preview && <img src={preview} alt="Vista previa" className="preview-imagen" />}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
