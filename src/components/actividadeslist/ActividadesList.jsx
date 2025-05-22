import React, { useState, useEffect } from "react";
import { db } from "../../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useProject } from "../../context/ProjectContext";
import Sidebar from "../../components/Sidebar";
import editIcon from "../../assets/iconos/edit.png";
import deleteIcon from "../../assets/iconos/delete.png";
import checkIcon from "../../assets/iconos/check.png";
import closeIcon from "../../assets/iconos/close.png";
import "./ActividadesList.css";

const ActividadesList = () => {
 const [leyendaVisible, setLeyendaVisible] = useState({});


  const [actividades, setActividades] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editDatos, setEditDatos] = useState({});
  const [subtareaInput, setSubtareaInput] = useState({});
  const [editandoSubtarea, setEditandoSubtarea] = useState({});
  const [nuevoNombreSubtarea, setNuevoNombreSubtarea] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(null); // Este estado es para el menú de acciones que parece estar oculto por CSS
  const [visibles, setVisibles] = useState({});
  const [contadores, setContadores] = useState({
    finalizado: 0,
    enProceso: 0,
    cancelado: 0,
  });
  const { project } = useProject();

  useEffect(() => {
    const storedProject = JSON.parse(localStorage.getItem("project"));
    if (!project?.id && storedProject) project.id = storedProject.id;
    if (project?.id) obtenerActividades(project.id);
  }, [project]);

  const toggleVisibilidad = (id) => {
    setVisibles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const contarEstados = (actividades) => {
    const conteo = { finalizado: 0, enProceso: 0, cancelado: 0 };
    actividades.forEach((act) => {
      if (conteo[act.estado] !== undefined) conteo[act.estado]++;
    });
    setContadores(conteo);
  };


const toggleLeyenda = (id) => {
  setLeyendaVisible((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};



  const obtenerActividades = async (projectId) => {
    const q = query(
      collection(db, "actividades"),
      where("proyectoId", "==", projectId)
    );
    const data = await getDocs(q);
    const actividadesCargadas = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setActividades(actividadesCargadas);
    contarEstados(actividadesCargadas);
  };

  const agregarActividad = async () => {
    const projectId =
      project?.id || JSON.parse(localStorage.getItem("project"))?.id;
    if (!nuevaActividad.trim() || !projectId) return;
    await addDoc(collection(db, "actividades"), {
      nombre: nuevaActividad,
      subtareas: [],
      estado: "enProceso",
      fechaInicio,
      fechaFin,
      proyectoId: projectId,
    });
    setNuevaActividad("");
    setFechaInicio("");
    setFechaFin("");
    obtenerActividades(projectId);
  };

  const activarEdicion = (actividad) => {
    setEditandoId(actividad.id);
    setEditDatos({
      nombre: actividad.nombre,
      fechaInicio: actividad.fechaInicio || "",
      fechaFin: actividad.fechaFin || "",
      fechaFinalizado: actividad.fechaFinalizado || "",
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditDatos({});
  };

  const guardarEdicion = async () => {
    const act = actividades.find((a) => a.id === editandoId);
    await updateDoc(doc(db, "actividades", editandoId), {
      nombre: editDatos.nombre,
      fechaInicio: editDatos.fechaInicio,
      fechaFin: editDatos.fechaFin,
      ...(act.estado === "finalizado" &&
        !act.fechaFinalizado && {
          fechaFinalizado: new Date().toISOString().split("T")[0],
        }),
    });
    setEditandoId(null);
    obtenerActividades(project?.id);
  };

  const agregarSubtarea = async (id) => {
    const input = subtareaInput[id]?.trim();
    if (!input) return;
    const actividad = actividades.find((a) => a.id === id);
    const nuevas = [
      ...actividad.subtareas,
      { nombre: input, completado: false, fechaCompletado: null },
    ];
    await updateDoc(doc(db, "actividades", id), { subtareas: nuevas });
    setSubtareaInput({ ...subtareaInput, [id]: "" });
    setMenuAbierto(null); // Resetea el menú si se usa
    obtenerActividades(project?.id);
  };

  const editarSubtarea = async (actividadId, index, nuevoNombre) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    nuevasSubtareas[index].nombre = nuevoNombre;
    await updateDoc(doc(db, "actividades", actividadId), {
      subtareas: nuevasSubtareas,
    });
    setEditandoSubtarea({ ...editandoSubtarea, [actividadId]: null });
    setNuevoNombreSubtarea({ ...nuevoNombreSubtarea, [actividadId]: "" });
    obtenerActividades(project?.id); // Añadido para actualizar la UI
  };

  const cancelarEdicionSubtarea = (actividadId) => {
    setEditandoSubtarea({ ...editandoSubtarea, [actividadId]: null });
    setNuevoNombreSubtarea({ ...nuevoNombreSubtarea, [actividadId]: "" });
  };

  const toggleSubtarea = async (actividadId, index) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    const actual = nuevasSubtareas[index];
    actual.completado = !actual.completado;
    actual.fechaCompletado = actual.completado
      ? new Date().toISOString().split("T")[0]
      : null;
    await updateDoc(doc(db, "actividades", actividadId), {
      subtareas: nuevasSubtareas,
    });
    obtenerActividades(project?.id);
  };

  // NUEVA FUNCIÓN: Para marcar/desmarcar todas las subtareas desde el checkbox principal
  const toggleTodasSubtareas = async (actividadId, completar) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    if (!actividad) return;

    if (completar) {
      // Validar que NO hay subtareas incompletas
      const hayIncompletas = actividad.subtareas.some((s) => !s.completado);
      if (hayIncompletas) {
        alert(
          "No puedes marcar la tarea como completada si hay subtareas pendientes."
        );
        return;
      }
    }

    const nuevasSubtareas = actividad.subtareas.map((sub) => ({
      ...sub,
      completado: completar,
      fechaCompletado: completar
        ? new Date().toISOString().split("T")[0]
        : null,
    }));

    await updateDoc(doc(db, "actividades", actividadId), {
      subtareas: nuevasSubtareas,
    });
    obtenerActividades(project?.id);
  };

  const eliminarSubtarea = async (actividadId, index) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevas = [...actividad.subtareas];
    nuevas.splice(index, 1);
    await updateDoc(doc(db, "actividades", actividadId), { subtareas: nuevas });
    obtenerActividades(project?.id);
  };

  const eliminarActividad = async (id) => {
    await deleteDoc(doc(db, "actividades", id));
    obtenerActividades(project?.id);
  };

  const cambiarEstadoCiclo = async (actividad) => {
    const estados = ["enProceso", "finalizado", "cancelado"];
    const index = estados.indexOf(actividad.estado);
    const nuevoEstado = estados[(index + 1) % estados.length];

    const updateData = { estado: nuevoEstado };

    if (nuevoEstado === "finalizado" && !actividad.fechaFinalizado) {
      updateData.fechaFinalizado = new Date().toISOString().split("T")[0];
    } else if (nuevoEstado !== "finalizado") {
      updateData.fechaFinalizado = null; // Clear date if not finalizado
    }

    await updateDoc(doc(db, "actividades", actividad.id), updateData);
    obtenerActividades(project?.id);
  };

  const colorEstado = (estado) => {
    if (estado === "finalizado") return "#2ecc71";
    if (estado === "enProceso") return "#f1c40f";
    return "#e74c3c";
  };

  const guardarEdicionSubtarea = async (actividadId, index, nombre) => {
    await editarSubtarea(actividadId, index, nombre);
  };

  const todasCompletadas = (subtareas) =>
    subtareas.length > 0 && subtareas.every((s) => s.completado);

  const toggleMenu = (id) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  const handleEditActividad = (actividad) => {
    activarEdicion(actividad);
    toggleMenu(null);
  };

  // Functions for the floating add subtask button (mantengo la lógica aunque estén ocultos por CSS)

  return (
    <div className="layout">
      <Sidebar />
      <div className="contenido">
        <h2 className="titulo">Gestión de Tareas</h2>

        <div className="estado-leyenda">
          <span>
            <span className="estado verde" /> Finalizado:{" "}
            {contadores.finalizado}
          </span>
          <span>
            <span className="estado amarillo" /> En Proceso:{" "}
            {contadores.enProceso}
          </span>
          <span>
            <span className="estado rojo" /> Cancelado: {contadores.cancelado}
          </span>
        </div>

        

        <div className="form-agregar">
          <input
            type="text"
            placeholder="Nombre de la tarea"
            value={nuevaActividad}
            onChange={(e) => setNuevaActividad(e.target.value)}
          />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
          <button onClick={agregarActividad}>+</button>
        </div>

        <div className="lista-tareas">
          {actividades.map((act) => (
            <React.Fragment key={act.id}>
              <div className="tarjeta-tarea fade-in">
                <div className="info-tarea">
                  <input
                    type="checkbox"
                    checked={todasCompletadas(act.subtareas)}
                    onChange={() =>
                      toggleTodasSubtareas(
                        act.id,
                        !todasCompletadas(act.subtareas)
                      )
                    }
                  />
                  <div
                    style={{ cursor: "pointer", flex: 1 }}
                    onClick={() => toggleVisibilidad(act.id)}
                  >
                    <strong>{act.nombre}</strong>
                  </div>

                  <div className="fecha-estado-wrapper">
                    <div className={`fecha-pill ${act.estado}`}>
                      {new Date(
                        new Date(act.fechaInicio).getTime() + 86400000
                      ).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      -{" "}
                      {new Date(
                        new Date(act.fechaFin).getTime() + 86400000
                      ).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>

                    <button
                      className="btn-estado"
                      onClick={() => cambiarEstadoCiclo(act)}
                      style={{ backgroundColor: colorEstado(act.estado) }}
                    />
                  </div>
                </div>

               <div style={{ position: "relative" }}>
  <button
    onClick={() => toggleLeyenda(act.id)}
    className="btn-tres-puntos"
  >
    ⋯
  </button>

  {leyendaVisible[act.id] && (
    <div className="leyenda-colores">
      <strong>Estado:</strong>
      <div><span className="punto verde" /> Finalizado</div>
      <div><span className="punto amarillo" /> En Proceso</div>
      <div><span className="punto rojo" /> Cancelado</div>
    </div>
  )}
</div>


                {editandoId === act.id && (
                  <div className="form-editar-tarea">
                    <input
                      type="text"
                      value={editDatos.nombre}
                      onChange={(e) =>
                        setEditDatos({ ...editDatos, nombre: e.target.value })
                      }
                    />
                    <input
                      type="date"
                      value={editDatos.fechaInicio}
                      onChange={(e) =>
                        setEditDatos({
                          ...editDatos,
                          fechaInicio: e.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      value={editDatos.fechaFin}
                      onChange={(e) =>
                        setEditDatos({ ...editDatos, fechaFin: e.target.value })
                      }
                    />
                    <div className="botones-editar">
                      <button onClick={guardarEdicion}>
                        <img src={checkIcon} alt="guardar" />
                      </button>
                      <button onClick={cancelarEdicion}>
                        <img src={closeIcon} alt="cancelar" />
                      </button>
                    </div>
                  </div>
                )}

                {visibles[act.id] && (
                  <div className="agregar-subtarea">
                    <input
                      type="text"
                      placeholder="Nueva subtarea"
                      value={subtareaInput[act.id] || ""}
                      onChange={(e) =>
                        setSubtareaInput({
                          ...subtareaInput,
                          [act.id]: e.target.value,
                        })
                      }
                    />
                    <button onClick={() => agregarSubtarea(act.id)}>+</button>
                  </div>
                )}
              </div>

              {/* Botones FUERA de la tarjeta */}
              <div className="acciones-tarea-principal acciones-abajo">
                <button
                  className="btn-accion edit-btn"
                  onClick={() => handleEditActividad(act)}
                >
                  <img src={editIcon} alt="editar" />
                </button>
                <button
                  className="btn-accion delete-btn"
                  onClick={() => eliminarActividad(act.id)}
                >
                  <img src={deleteIcon} alt="eliminar" />
                </button>
              </div>

              {visibles[act.id] && editandoId !== act.id && (
                <>
                  {act.subtareas.map((sub, idx) => (
                    <div
                      key={idx}
                      className={`subtarea-card fade-in ${
                        sub.completado ? "subtarea-completada" : ""
                      }`}
                    >
                      <div className="contenido-subtarea">
                        <input
                          type="checkbox"
                          className="checkbox-subtarea"
                          checked={sub.completado}
                          onChange={() => toggleSubtarea(act.id, idx)}
                        />

                        {editandoSubtarea[act.id] === idx ? (
                          <input
                            type="text"
                            value={nuevoNombreSubtarea[act.id] || sub.nombre}
                            onChange={(e) =>
                              setNuevoNombreSubtarea({
                                ...nuevoNombreSubtarea,
                                [act.id]: e.target.value,
                              })
                            }
                            className="input-edicion-subtarea"
                          />
                        ) : (
                          <span className="nombre-subtarea">{sub.nombre}</span>
                        )}
                        {sub.completado && sub.fechaCompletado && (
                          <small className="fecha-subtarea">
                            {" "}
                            - Finalizado: {sub.fechaCompletado}
                          </small>
                        )}
                      </div>
                      <div className="acciones-subtarea">
                        {editandoSubtarea[act.id] === idx ? (
                          <>
                            <button
                              onClick={() =>
                                guardarEdicionSubtarea(
                                  act.id,
                                  idx,
                                  nuevoNombreSubtarea[act.id]
                                )
                              }
                            >
                              <img src={checkIcon} alt="guardar" />
                            </button>
                            <button
                              onClick={() => cancelarEdicionSubtarea(act.id)}
                            >
                              <img src={closeIcon} alt="cancelar" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditandoSubtarea({
                                  ...editandoSubtarea,
                                  [act.id]: idx,
                                })
                              }
                            >
                              <img src={editIcon} alt="editar" />
                            </button>
                            <button
                              onClick={() => eliminarSubtarea(act.id, idx)}
                            >
                              <img src={deleteIcon} alt="eliminar" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActividadesList;
