import React, { useState, useEffect } from "react";
import { useProject } from "../context/ProjectContext";
import editarIcono from "../assets/iconos/edit.png";
import eliminarIcono from "../assets/iconos/delete.png";
import checkIcon from "../assets/iconos/check.png";
import { updateProject, deleteProject } from "../services/projectsService";
import "../ProveedoresCss/DetalleProyecto.css";
import { useNavigate } from "react-router-dom";
import PantallaCarga from "../components/PantallaCarga"; // ✅ Agregar
const DetalleProyectoView = () => {
  const navigate = useNavigate();
const [loading, setLoading] = useState(true);

  const { project, setProject } = useProject();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [preview, setPreview] = useState(project.imagen || null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [mostrarModalImagen, setMostrarModalImagen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [datosEditables, setDatosEditables] = useState({
    ...project,
    fechaInicio: formatFechaParaInput(project?.fechaInicio),
    fechaFin: formatFechaParaInput(project?.fechaFin),
  });

  useEffect(() => {
  const handleOnline = () => {
    setIsOffline(false);
    syncOfflineChanges();
  };
  const handleOffline = () => {
    setIsOffline(true);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  setIsOffline(!navigator.onLine);

  // ✅ Mostrar pantalla de carga durante 1 segundo
  const timeout = setTimeout(() => {
    setLoading(false);
  }, 300);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    clearTimeout(timeout);
  };
}, []);

  function formatFechaParaInput(fecha) {
    try {
      if (fecha?.toDate) fecha = fecha.toDate();
      else if (typeof fecha === "string") fecha = new Date(fecha);
      if (isNaN(fecha.getTime())) return "";
      return fecha.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  const handleEditar = async () => {
    if (modoEdicion) {
      try {
        const fechaInicioValida = datosEditables.fechaInicio
          ? new Date(`${datosEditables.fechaInicio}T00:00:00`)
          : null;
        const fechaFinValida = datosEditables.fechaFin
          ? new Date(`${datosEditables.fechaFin}T00:00:00`)
          : null;

        if (
          (fechaInicioValida && isNaN(fechaInicioValida.getTime())) ||
          (fechaFinValida && isNaN(fechaFinValida.getTime()))
        ) {
          alert("Formato de fecha inválido.");
          return;
        }

        let base64Imagen = datosEditables.imagen;
        if (nuevaImagen) {
          base64Imagen = await convertirImagenABase64(nuevaImagen);
        }

        const datosActualizados = {
          ...datosEditables,
          presupuesto: parseFloat(datosEditables.presupuesto),
          fechaInicio: fechaInicioValida,
          fechaFin: fechaFinValida,
          imagen: base64Imagen,
        };

        if (isOffline) {
          // Guardar los cambios localmente si está offline
          localStorage.setItem('offlineProjectUpdates', JSON.stringify({ id: project.id, data: datosActualizados }));
          alert("Estás offline. Los cambios se guardaron localmente y se sincronizarán cuando te conectes.");
          
          // Actualizar el estado local para reflejar los cambios inmediatamente
          setProject({ ...project, ...datosActualizados });
        } else {
          await updateProject(project.id, datosActualizados);
          setProject({ ...project, ...datosActualizados });
        }
      } catch (error) {
        console.error("Error al actualizar el proyecto:", error);
        alert("Ocurrió un error al actualizar.");
      }
    }

    setModoEdicion(!modoEdicion);
  };

  const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Deseás eliminar este proyecto?")) {
      if (isOffline) {
        // Guardar la eliminación localmente si está offline
        localStorage.setItem('offlineProjectDeletion', project.id);
        alert("Estás offline. El proyecto se eliminará cuando te conectes.");
      } else {
        await deleteProject(project.id);
        alert("Proyecto eliminado.");
        navigate("/proyecto");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosEditables((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setNuevaImagen(archivo);
      setPreview(URL.createObjectURL(archivo));
    }
  };

  // Función para sincronizar los cambios guardados localmente
  const syncOfflineChanges = () => {
    const offlineUpdates = localStorage.getItem('offlineProjectUpdates');
    if (offlineUpdates) {
      const { id, data } = JSON.parse(offlineUpdates);
      updateProject(id, data).then(() => {
        localStorage.removeItem('offlineProjectUpdates');
        setProject({ ...project, ...data }); // Actualiza el estado local
        alert("Proyecto actualizado correctamente.");
      }).catch((error) => {
        console.error("Error al sincronizar cambios:", error);
      });
    }

    const offlineDeletion = localStorage.getItem('offlineProjectDeletion');
    if (offlineDeletion) {
      deleteProject(offlineDeletion).then(() => {
        localStorage.removeItem('offlineProjectDeletion');
        alert("Proyecto eliminado correctamente.");
        navigate("/proyecto");
      }).catch((error) => {
        console.error("Error al sincronizar eliminación:", error);
      });
    }
  };
if (loading || !project || Object.keys(project).length === 0) {
  return <PantallaCarga mensaje="Cargando proyecto..." />;
}

  return (
    <div className="dpv-wrapper">
      <div className="dpv-card">
        <div className="dpv-header">
          <img
            src={modoEdicion ? checkIcon : editarIcono}
            alt={modoEdicion ? "Guardar" : "Editar"}
            className="dpv-icono"
            onClick={handleEditar}
            title={modoEdicion ? "Guardar cambios" : "Editar proyecto"}
          />
          <img
            src={eliminarIcono}
            alt="Eliminar"
            className="dpv-icono"
            onClick={handleEliminar}
            title="Eliminar proyecto"
          />
        </div>

        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            className="dpv-imagen"
            onClick={() => setMostrarModalImagen(true)}
          />
        )}

        {modoEdicion && (
          <div className="dpv-campo-imagen">
            <label>Cambiar imagen:</label>
            <input type="file" accept="image/*" onChange={handleImagenChange} />
          </div>
        )}

        {modoEdicion ? (
          <>
            <input name="nombre" value={datosEditables.nombre} onChange={handleChange} className="dpv-input" />
            <input name="cliente" value={datosEditables.cliente} onChange={handleChange} className="dpv-input" />
            <textarea name="descripcion" value={datosEditables.descripcion} onChange={handleChange} className="dpv-textarea" />
            <input name="presupuesto" type="number" value={datosEditables.presupuesto} onChange={handleChange} className="dpv-input" />

            <div className="dpv-fechas-estado">
              <div className="dpv-fecha-item">
                <label>Fecha in :</label>
                <input type="date" name="fechaInicio" value={datosEditables.fechaInicio} onChange={handleChange} />
              </div>
              <div className="dpv-fecha-item">
                <label>Fecha fin :</label>
                <input type="date" name="fechaFin" value={datosEditables.fechaFin} onChange={handleChange} />
              </div>
            </div>

            <div className="dpv-estado">
              {['En progreso', 'Finalizado', 'Cancelado'].map((estado) => (
                <label key={estado}>
                  <input
                    type="radio"
                    name="estado"
                    value={estado}
                    checked={datosEditables.estado === estado}
                    onChange={handleChange}
                  />
                  {estado}
                </label>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="dpv-nombre">{project?.nombre}</h2>
            <p className="dpv-cliente">Cliente : {project?.cliente}</p>
            <div className="dpv-descripcion">{project?.descripcion}</div>
            <div className="dpv-presupuesto">Presupuesto : ${project?.presupuesto}</div>

            <div className="dpv-fechas-estado">
              <div className="dpv-fecha-item">
                <label>Fecha in :</label>
                <input type="text" readOnly value={formatFechaParaInput(project?.fechaInicio)} />
              </div>
              <div className="dpv-fecha-item">
                <label>Fecha fin :</label>
                <input type="text" readOnly value={formatFechaParaInput(project?.fechaFin)} />
              </div>
            </div>

            <div className="dpv-estado">
              {['En progreso', 'Finalizado', 'Cancelado'].map((estado) => (
                <span key={estado} className={project?.estado === estado ? "dpv-activo" : ""}>
                  {estado}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {mostrarModalImagen && (
        <div className="modal-imagen-overlay" onClick={() => setMostrarModalImagen(false)}>
          <img src={preview} alt="Vista ampliada" className="modal-imagen" />
        </div>
      )}
    </div>
  );
};

export default DetalleProyectoView;
