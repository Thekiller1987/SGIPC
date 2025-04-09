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
import { useNavigate } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";
import "./ActividadesList.css";

const ActividadesList = () => {
  const [actividades, setActividades] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [subtareaInput, setSubtareaInput] = useState({});
  const [editandoActividad, setEditandoActividad] = useState(null);
  const navigate = useNavigate();
  const { project } = useProject(); // ✅ obtenemos el proyecto global
  const projectId = project?.id;    // ✅ sacamos el id directamente

  useEffect(() => {
    if (projectId) obtenerActividades();
  }, [projectId]);

  const obtenerActividades = async () => {
    if (!projectId) return;
    const actividadesCollection = collection(db, "actividades");
    const q = query(actividadesCollection, where("proyectoId", "==", projectId));
    const data = await getDocs(q);
    setActividades(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const agregarActividad = async () => {
    if (!nuevaActividad.trim() || !projectId) return;
    await addDoc(collection(db, "actividades"), {
      nombre: nuevaActividad,
      subtareas: [],
      completado: false,
      proyectoId: projectId,
    });
    setNuevaActividad("");
    obtenerActividades();
  };

  const eliminarActividad = async (id) => {
    await deleteDoc(doc(db, "actividades", id));
    obtenerActividades();
  };

  const agregarSubtarea = async (actividadId) => {
    if (!subtareaInput[actividadId]?.trim()) return;
    const actividadRef = doc(db, "actividades", actividadId);
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [
      ...actividad.subtareas,
      { nombre: subtareaInput[actividadId], completado: false },
    ];
    await updateDoc(actividadRef, { subtareas: nuevasSubtareas });
    setSubtareaInput({ ...subtareaInput, [actividadId]: "" });
    obtenerActividades();
  };

  const eliminarSubtarea = async (actividadId, index) => {
    const actividadRef = doc(db, "actividades", actividadId);
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    nuevasSubtareas.splice(index, 1);
    await updateDoc(actividadRef, { subtareas: nuevasSubtareas });
    obtenerActividades();
  };

  const toggleSubtarea = async (actividadId, index) => {
    const actividadRef = doc(db, "actividades", actividadId);
    const actividad = actividades.find((a) => a.id === actividadId);
    const nuevasSubtareas = [...actividad.subtareas];
    nuevasSubtareas[index].completado = !nuevasSubtareas[index].completado;
    await updateDoc(actividadRef, { subtareas: nuevasSubtareas });
    obtenerActividades();
  };

  const editarActividad = async (actividadId, nuevoNombre) => {
    if (!nuevoNombre.trim()) return;
    const actividadRef = doc(db, "actividades", actividadId);
    await updateDoc(actividadRef, { nombre: nuevoNombre });
    setEditandoActividad(null);
    obtenerActividades();
  };

  const calcularProgreso = (subtareas) => {
    if (subtareas.length === 0) return 0;
    const completadas = subtareas.filter((s) => s.completado).length;
    return (completadas / subtareas.length) * 100;
  };

  return (
    <div className="container">
      <button
        onClick={() => navigate("/project-dashboard")}
        className="btn-back"
      >
        Volver al Proyecto
      </button>
      <h2>Lista de Actividades</h2>
      {projectId ? (
        <>
          <div className="add-activity">
            <input
              type="text"
              placeholder="Nueva actividad"
              value={nuevaActividad}
              onChange={(e) => setNuevaActividad(e.target.value)}
            />
            <button onClick={agregarActividad} className="btn-add">
              Agregar
            </button>
          </div>
          <ul className="activity-list">
            {actividades.map((actividad) => (
              <li key={actividad.id} className="activity-item">
                <div className="actividad-header">
                  {editandoActividad === actividad.id ? (
                    <input
                      type="text"
                      defaultValue={actividad.nombre}
                      onBlur={(e) =>
                        editarActividad(actividad.id, e.target.value)
                      }
                    />
                  ) : (
                    <strong>{actividad.nombre}</strong>
                  )}
                  <button
                    onClick={() => setEditandoActividad(actividad.id)}
                    className="btn-edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminarActividad(actividad.id)}
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{
                      width: `${calcularProgreso(actividad.subtareas)}%`,
                    }}
                  >
                    {calcularProgreso(actividad.subtareas)}%
                  </div>
                </div>
                <ul className="subtask-list">
                  {actividad.subtareas.map((subtarea, index) => (
                    <li key={index} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtarea.completado}
                        onChange={() => toggleSubtarea(actividad.id, index)}
                      />
                      {subtarea.nombre}
                      <button
                        onClick={() => eliminarSubtarea(actividad.id, index)}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="add-subtask">
                  <input
                    type="text"
                    placeholder="Nueva subtarea"
                    value={subtareaInput[actividad.id] || ""}
                    onChange={(e) =>
                      setSubtareaInput({
                        ...subtareaInput,
                        [actividad.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => agregarSubtarea(actividad.id)}
                    className="btn-add"
                  >
                    ➕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Error: No se ha seleccionado un proyecto válido.</p>
      )}
    </div>
  );
};

export default ActividadesList;
