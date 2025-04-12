import React, { useState } from "react";
import { useProject } from "../context/ProjectContext";
import editarIcono from "../assets/iconos/edit.png";
import eliminarIcono from "../assets/iconos/delete.png";
import checkIcon from "../assets/iconos/check.png";
import { updateProject, deleteProject } from "../services/projectsService";
import "../ProveedoresCss/DetalleProyecto.css";

const DetalleProyectoView = () => {
  const { project, setProject } = useProject();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [preview, setPreview] = useState(project.imagen || null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
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
    <div className="detalle-proyecto-card">
      <div className="detalle-proyecto-header">
        <img
          src={modoEdicion ? checkIcon : editarIcono}
          alt={modoEdicion ? "Guardar" : "Editar"}
          className="icono-proyecto"
          onClick={handleEditar}
          title={modoEdicion ? "Guardar cambios" : "Editar proyecto"}
        />
        <img
          src={eliminarIcono}
          alt="Eliminar"
          className="icono-proyecto"
          onClick={handleEliminar}
          title="Eliminar proyecto"
        />
      </div>

      {preview && (
        <img src={preview} alt="Vista previa" className="imagen-proyecto" />
      )}

      {modoEdicion && (
        <div className="campo-horizontal">
          <label>Cambiar imagen:</label>
          <input type="file" accept="image/*" onChange={handleImagenChange} />
        </div>
      )}

      {modoEdicion ? (
        <>
          <input
            name="nombre"
            value={datosEditables.nombre}
            onChange={handleChange}
            className="input-detalle-proyecto"
          />
          <input
            name="cliente"
            value={datosEditables.cliente}
            onChange={handleChange}
            className="input-detalle-proyecto"
          />
          <textarea
            name="descripcion"
            value={datosEditables.descripcion}
            onChange={handleChange}
            className="textarea-detalle-proyecto"
          />
          <input
            name="presupuesto"
            type="number"
            value={datosEditables.presupuesto}
            onChange={handleChange}
            className="input-detalle-proyecto"
          />

          <div className="fechas-estado-proyecto">
            <div className="fecha-item">
              <label>Fecha in :</label>
              <input
                type="date"
                name="fechaInicio"
                value={datosEditables.fechaInicio}
                onChange={handleChange}
              />
            </div>
            <div className="fecha-item">
              <label>Fecha fin :</label>
              <input
                type="date"
                name="fechaFin"
                value={datosEditables.fechaFin}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="estado-proyecto">
            {["En progreso", "Finalizado", "Cancelado"].map((estado) => (
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
          <h2 className="nombre-proyecto">{project?.nombre}</h2>
          <p className="cliente-proyecto">Cliente : {project?.cliente}</p>
          <div className="descripcion-proyecto">{project?.descripcion}</div>
          <div className="presupuesto-proyecto">
            Presupuesto : ${project?.presupuesto}
          </div>

          <div className="fechas-estado-proyecto">
            <div className="fecha-item">
              <label>Fecha in :</label>
              <input
                type="text"
                readOnly
                value={formatFechaParaInput(project?.fechaInicio)}
              />
            </div>
            <div className="fecha-item">
              <label>Fecha fin :</label>
              <input
                type="text"
                readOnly
                value={formatFechaParaInput(project?.fechaFin)}
              />
            </div>
          </div>

          <div className="estado-proyecto">
            {["En progreso", "Finalizado", "Cancelado"].map((estado) => (
              <span
                key={estado}
                className={project?.estado === estado ? "estado-activo" : ""}
              >
                {estado}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DetalleProyectoView;
