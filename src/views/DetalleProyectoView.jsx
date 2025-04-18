import React, { useState } from "react";
import { useProject } from "../context/ProjectContext";
import editarIcono from "../assets/iconos/edit.png";
import eliminarIcono from "../assets/iconos/delete.png";
import checkIcon from "../assets/iconos/check.png";
import { updateProject, deleteProject } from "../services/projectsService";
import "../ProveedoresCss/DetalleProyecto.css";
import { useNavigate } from "react-router-dom";

const DetalleProyectoView = () => {
  const navigate = useNavigate();

  const { project, setProject } = useProject();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [preview, setPreview] = useState(project.imagen || null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [mostrarModalImagen, setMostrarModalImagen] = useState(false);

  const [datosEditables, setDatosEditables] = useState({
    ...project,
    fechaInicio: formatFechaParaInput(project?.fechaInicio),
    fechaFin: formatFechaParaInput(project?.fechaFin),
  });

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

        await updateProject(project.id, datosActualizados);
        setProject({ ...project, ...datosActualizados });
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
      await deleteProject(project.id);
      alert("Proyecto eliminado.");
      navigate("/proyecto");
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
