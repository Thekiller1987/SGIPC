// ✅ ActividadesList.jsx COMPLETO Y FUNCIONAL CON CÍRCULO DE ESTADO INTERACTIVO
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
import flechaIcon from "../../assets/iconos/flecha.png";
import checkIcon from "../../assets/iconos/check.png";
import closeIcon from "../../assets/iconos/close.png";
import "./ActividadesList.css";

const ActividadesList = () => {
  const [actividades, setActividades] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editDatos, setEditDatos] = useState({});
  const [subtareaInput, setSubtareaInput] = useState({});
  const [editandoSubtarea, setEditandoSubtarea] = useState({});
  const [nuevoNombreSubtarea, setNuevoNombreSubtarea] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [visibles, setVisibles] = useState({});
  const [contadores, setContadores] = useState({ finalizado: 0, enProceso: 0, cancelado: 0 });
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

  const obtenerActividades = async (projectId) => {
    const q = query(collection(db, "actividades"), where("proyectoId", "==", projectId));
    const data = await getDocs(q);
    const actividadesCargadas = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setActividades(actividadesCargadas);
    contarEstados(actividadesCargadas);
  };

  const agregarActividad = async () => {
    const projectId = project?.id || JSON.parse(localStorage.getItem("project"))?.id;
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
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditDatos({});
  };

  const guardarEdicion = async () => {
    if (!editDatos.nombre.trim()) return;
    await updateDoc(doc(db, "actividades", editandoId), {
      nombre: editDatos.nombre,
      fechaInicio: editDatos.fechaInicio,
      fechaFin: editDatos.fechaFin,
    });
    setEditandoId(null);
    obtenerActividades(project?.id);
  };

  const agregarSubtarea = async (id) => {
    const input = subtareaInput[id]?.trim();
    if (!input) return;
    const actividad = actividades.find((a) => a.id === id);
    const nuevas = [...actividad.subtareas, { nombre: input, completado: false }];
    await updateDoc(doc(db, "actividades", id), { subtareas: nuevas });
    setSubtareaInput({ ...subtareaInput, [id]: "" });
    setMenuAbierto(null);
    obtenerActividades(project?.id);
  };

  const editarSubtarea = async (actividadId, index, nuevoNombre) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    nuevasSubtareas[index].nombre = nuevoNombre;
    await updateDoc(doc(db, "actividades", actividadId), { subtareas: nuevasSubtareas });
    setEditandoSubtarea({ ...editandoSubtarea, [actividadId]: null });
    setNuevoNombreSubtarea({ ...nuevoNombreSubtarea, [actividadId]: "" });
  };

  const cancelarEdicionSubtarea = (actividadId) => {
    setEditandoSubtarea({ ...editandoSubtarea, [actividadId]: null });
    setNuevoNombreSubtarea({ ...nuevoNombreSubtarea, [actividadId]: "" });
  };

  const toggleSubtarea = async (actividadId, index) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    nuevasSubtareas[index].completado = !nuevasSubtareas[index].completado;
    await updateDoc(doc(db, "actividades", actividadId), { subtareas: nuevasSubtareas });
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
    await updateDoc(doc(db, "actividades", actividad.id), { estado: nuevoEstado });
    obtenerActividades(project?.id);
  };

  const colorEstado = (estado) => {
    if (estado === "finalizado") return "#27ae60";
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
    toggleMenu(null); // Cerrar el menú al hacer clic en Editar
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="contenido">
        <h2 className="titulo">Tareas</h2>
        <div className="estado-leyenda">
          <span><span className="estado verde" /> Finalizado: {contadores.finalizado}</span>
          <span><span className="estado amarillo" /> En Proceso: {contadores.enProceso}</span>
          <span><span className="estado rojo" /> Cancelado: {contadores.cancelado}</span>
        </div>
        <div className="form-agregar">
          <input type="text" placeholder="Nombre de la tarea" value={nuevaActividad} onChange={(e) => setNuevaActividad(e.target.value)} />
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          <button onClick={agregarActividad}>+</button>
        </div>
        <div className="lista-tareas">
          {actividades.map((act) => (
            <div key={act.id} className="tarjeta-tarea fade-in">
              <div className="info-tarea">
                <input type="checkbox" checked={todasCompletadas(act.subtareas)} readOnly onClick={(e) => e.preventDefault()} style={{ pointerEvents: 'none' }} />
                <div style={{ cursor: "pointer", flex: 1 }} onClick={() => toggleVisibilidad(act.id)}>
                  <strong>{act.nombre}</strong>
                  <br />
                  <small className="fecha-tarea">Inicio: {act.fechaInicio || "-"} | Fin: {act.fechaFin || "-"}</small>
                </div>
                <div className="botones-tarea">
                  <button
                    className="btn-estado"
                    title="Cambiar estado"
                    onClick={() => cambiarEstadoCiclo(act)}
                    style={{
                      backgroundColor: colorEstado(act.estado),
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      marginRight: "8px"
                    }}
                  ></button>
                  <div className="menu-acciones">
                    <button onClick={() => toggleMenu(act.id)}>
                      <img src={flechaIcon} alt="acciones" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </button>
                    {menuAbierto === act.id && (
                      <div className="menu-opciones">
                        <button onClick={() => handleEditActividad(act)}>
                          <img src={editIcon} alt="editar" style={{ width: '16px', height: '16px', marginRight: '5px' }} /> Editar
                        </button>
                        <button onClick={() => eliminarActividad(act.id)}>
                          <img src={deleteIcon} alt="eliminar" style={{ width: '16px', height: '16px', marginRight: '5px' }} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {editandoId === act.id && (
                <div className="form-editar-tarea">
                  <input
                    type="text"
                    value={editDatos.nombre}
                    onChange={(e) => setEditDatos({ ...editDatos, nombre: e.target.value })}
                    placeholder="Nuevo nombre"
                  />
                  <input
                    type="date"
                    value={editDatos.fechaInicio}
                    onChange={(e) => setEditDatos({ ...editDatos, fechaInicio: e.target.value })}
                  />
                  <input
                    type="date"
                    value={editDatos.fechaFin}
                    onChange={(e) => setEditDatos({ ...editDatos, fechaFin: e.target.value })}
                  />
                  <div className="botones-editar">
                    <button onClick={guardarEdicion}><img src={checkIcon} alt="guardar" /></button>
                    <button onClick={cancelarEdicion}><img src={closeIcon} alt="cancelar" /></button>
                  </div>
                </div>
              )}
              {visibles[act.id] && editandoId !== act.id && (
                <div className="subtareas">
                  {act.subtareas.map((sub, idx) => (
                    <div key={idx} className="subtarea-item fade-in">
                      {editandoSubtarea[act.id] === idx ? (
                        <>
                          <input type="text" value={nuevoNombreSubtarea[act.id] || sub.nombre} onChange={(e) => setNuevoNombreSubtarea({ ...nuevoNombreSubtarea, [act.id]: e.target.value })} />
                          <div className="subtarea-botones">
                            <button onClick={() => guardarEdicionSubtarea(act.id, idx, nuevoNombreSubtarea[act.id])}><img src={checkIcon} alt="guardar" /></button>
                            <button onClick={() => cancelarEdicionSubtarea(act.id)}><img src={closeIcon} alt="cancelar" /></button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input type="checkbox" checked={sub.completado} onChange={() => toggleSubtarea(act.id, idx)} />
                          <span className={sub.completado ? "completado" : ""}>{sub.nombre}</span>
                          <div className="subtarea-botones">
                            <button onClick={() => setEditandoSubtarea({ ...editandoSubtarea, [act.id]: idx })}><img src={editIcon} alt="edit" /></button>
                            <button onClick={() => eliminarSubtarea(act.id, idx)}><img src={deleteIcon} alt="delete" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="agregar-subtarea">
                    <input
                      type="text"
                      placeholder="Nueva subtarea"
                      value={subtareaInput[act.id] || ""}
                      onChange={(e) => setSubtareaInput({ ...subtareaInput, [act.id]: e.target.value })}
                    />
                    <button onClick={() => agregarSubtarea(act.id)}>+</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActividadesList;