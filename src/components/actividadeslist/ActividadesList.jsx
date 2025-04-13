import React, { useState, useEffect, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";
import Sidebar from "../../components/Sidebar";
import "./ActividadesList.css";

const ActividadesList = () => {
  const [actividades, setActividades] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [subtareaInput, setSubtareaInput] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(null);
  const menuRef = useRef(null);
  const { project } = useProject();
  const navigate = useNavigate();
  const projectId = project?.id;

  useEffect(() => {
    if (projectId) obtenerActividades();
  }, [projectId]);

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  const obtenerActividades = async () => {
    const actividadesCollection = collection(db, "actividades");
    const q = query(actividadesCollection, where("proyectoId", "==", projectId));
    const data = await getDocs(q);
    setActividades(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const agregarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    await addDoc(collection(db, "actividades"), {
      nombre: nuevaActividad,
      subtareas: [],
      estado: "enProceso",
      proyectoId,
    });
    setNuevaActividad("");
    obtenerActividades();
  };

  const editarActividad = async (id, nuevoNombre) => {
    if (!nuevoNombre.trim()) return;
    await updateDoc(doc(db, "actividades", id), { nombre: nuevoNombre });
    setEditandoId(null);
    obtenerActividades();
  };

  const eliminarActividad = async (id) => {
    await deleteDoc(doc(db, "actividades", id));
    obtenerActividades();
  };

  const agregarSubtarea = async (id) => {
    const input = subtareaInput[id]?.trim();
    if (!input) return;
    const actividad = actividades.find((a) => a.id === id);
    const nuevas = [...actividad.subtareas, { nombre: input, completado: false }];
    await updateDoc(doc(db, "actividades", id), { subtareas: nuevas });
    setSubtareaInput({ ...subtareaInput, [id]: "" });
    setMenuAbierto(null);
    obtenerActividades();
  };

  const toggleSubtarea = async (actividadId, index) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    nuevasSubtareas[index].completado = !nuevasSubtareas[index].completado;
    await updateDoc(doc(db, "actividades", actividadId), { subtareas: nuevasSubtareas });
    obtenerActividades();
  };

  const eliminarSubtarea = async (actividadId, index) => {
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevas = [...actividad.subtareas];
    nuevas.splice(index, 1);
    await updateDoc(doc(db, "actividades", actividadId), { subtareas: nuevas });
    obtenerActividades();
  };

  const cambiarEstado = async (id, estado) => {
    await updateDoc(doc(db, "actividades", id), { estado });
    obtenerActividades();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="contenido">
        <h2 className="titulo">Tareas</h2>

        <div className="estado-leyenda">
          <span><span className="estado verde" /> Finalizado</span>
          <span><span className="estado amarillo" /> En Proceso</span>
          <span><span className="estado rojo" /> Cancelado</span>
        </div>

        <div className="form-agregar">
          <input
            type="text"
            placeholder="Agregar nueva tarea"
            value={nuevaActividad}
            onChange={(e) => setNuevaActividad(e.target.value)}
          />
          <button onClick={agregarActividad}>+</button>
        </div>

        <div className="lista-tareas">
          {actividades.map((act) => (
            <div key={act.id} className="tarjeta-tarea fade-in">
              <div className="info-tarea">
                <input type="checkbox" disabled />
                {editandoId === act.id ? (
                  <input
                    type="text"
                    defaultValue={act.nombre}
                    onBlur={(e) => editarActividad(act.id, e.target.value)}
                  />
                ) : (
                  <span>{act.nombre}</span>
                )}
              </div>

              <div className="acciones-tarea">
                <button onClick={() => setEditandoId(act.id)}>✏️</button>
                <button onClick={() => eliminarActividad(act.id)}>🗑️</button>
                <button onClick={() => setMenuAbierto(menuAbierto === act.id ? null : act.id)}>⋯</button>
              </div>

              {menuAbierto === act.id && (
                <div className="menu-opciones" ref={menuRef}>
                  <div className="add-subtarea">
                    <input
                      type="text"
                      placeholder="Nueva subtarea"
                      value={subtareaInput[act.id] || ""}
                      onChange={(e) =>
                        setSubtareaInput({ ...subtareaInput, [act.id]: e.target.value })
                      }
                    />
                    <button onClick={() => agregarSubtarea(act.id)}>Guardar</button>
                  </div>
                  <div className="estado-selector">
                    <label>
                      <input
                        type="radio"
                        name={`estado-${act.id}`}
                        checked={act.estado === "finalizado"}
                        onChange={() => cambiarEstado(act.id, "finalizado")}
                      /> Finalizado
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`estado-${act.id}`}
                        checked={act.estado === "enProceso"}
                        onChange={() => cambiarEstado(act.id, "enProceso")}
                      /> En Proceso
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`estado-${act.id}`}
                        checked={act.estado === "cancelado"}
                        onChange={() => cambiarEstado(act.id, "cancelado")}
                      /> Cancelado
                    </label>
                  </div>
                </div>
              )}

              <div className="subtareas">
                {act.subtareas.map((sub, idx) => (
                  <div key={idx} className="subtarea-item fade-in">
                    <input
                      type="checkbox"
                      checked={sub.completado}
                      onChange={() => toggleSubtarea(act.id, idx)}
                    />
                    <span className={sub.completado ? "completado" : ""}>{sub.nombre}</span>
                    <button onClick={() => eliminarSubtarea(act.id, idx)}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActividadesList;
