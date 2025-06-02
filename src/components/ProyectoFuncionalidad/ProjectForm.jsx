import React, { useState, useEffect } from "react";
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Detecta si está offline

  const navigate = useNavigate();

  // Maneja el estado de la conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineProjects(); // Sincroniza proyectos guardados localmente
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Función para validar el formulario
  const validar = () => {
    const nuevosErrores = {};
    const regexPresupuesto = /^\d+(\.\d{1,2})?$/; // sólo números positivos y decimales

    if (!nombre.trim()) nuevosErrores.nombre = "Campo requerido";
    if (!descripcion.trim()) nuevosErrores.descripcion = "Campo requerido";
    if (!cliente.trim()) nuevosErrores.cliente = "Campo requerido";

    if (!presupuesto.trim()) {
      nuevosErrores.presupuesto = "Campo requerido";
    } else if (!regexPresupuesto.test(presupuesto)) {
      nuevosErrores.presupuesto = "Debe ser un número positivo válido";
    } else if (parseFloat(presupuesto) < 0) {
      nuevosErrores.presupuesto = "No puede ser negativo";
    }

    if (!fechaInicio) {
      nuevosErrores.fechaInicio = "Seleccione una fecha";
    }
    if (!fechaFin) {
      nuevosErrores.fechaFin = "Seleccione una fecha";
    }

    // Validar orden de fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (inicio > fin) {
        nuevosErrores.fechaFin = "La fecha fin debe ser mayor que la fecha de inicio";
      }
    }

    return nuevosErrores;
  };


  // Función para manejar el cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Función para comprimir imagen
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

  // Función para manejar el envío del formulario
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
        const base64Length = base64Image.length * (3 / 4); // Estimación real del tamaño
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

      if (isOffline) {
        // Guarda el proyecto localmente si está offline
        localStorage.setItem('offlineProject', JSON.stringify(projectData));
        alert("Estás offline. El proyecto se guardará localmente y se sincronizará cuando se conecte a internet.");
      } else {
        await createProject(projectData);
        navigate("/proyecto");
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    }
  };

  // Función para sincronizar proyectos guardados localmente cuando vuelva la conexión
  const syncOfflineProjects = () => {
    const offlineProject = localStorage.getItem('offlineProject');
    if (offlineProject) {
      const projectData = JSON.parse(offlineProject);
      createProject(projectData).then(() => {
        localStorage.removeItem('offlineProject'); // Elimina el proyecto guardado localmente después de sincronizar

      }).catch((error) => {
        console.error("Error al sincronizar proyecto:", error);
      });
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
          <input
            type="text"
            inputMode="decimal"
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
            onBeforeInput={(e) => {
              const char = e.data;
              const current = e.target.value;

              // Solo permitir números y un único punto decimal
              const isValid = /^[0-9.]$/.test(char);
              const alreadyHasDot = current.includes(".");
              if (!isValid || (char === "." && alreadyHasDot)) {
                e.preventDefault();
              }
            }}
            placeholder="Ingrese un monto válido"
          />

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
