import React, { useEffect, useState } from "react";
import { db } from "../../database/firebaseconfig";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import MaterialForm from "./MaterialForm";
import MaterialList from "./MaterialList";
import "../../PresupuestoCss/PresupuestoCalculator.css";

const EstructuraForm = ({ estructuraEnEdicion, setEstructuraEnEdicion }) => {
  const [nombre, setNombre] = useState("");
  const [materiales, setMateriales] = useState([]);

  // Si se edita, cargamos los valores
  useEffect(() => {
    if (estructuraEnEdicion) {
      setNombre(estructuraEnEdicion.nombre);
      setMateriales(estructuraEnEdicion.materiales || []);
    }
  }, [estructuraEnEdicion]);

  const agregarMaterial = (material) => {
    setMateriales([...materiales, material]);
  };

  const eliminarMaterial = (index) => {
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const guardarEstructura = async () => {
    if (!nombre.trim() || materiales.length === 0) {
      alert("Nombre de la estructura y al menos un material son obligatorios.");
      return;
    }

    try {
      if (estructuraEnEdicion) {
        // 🔄 Actualizar
        const ref = doc(db, "estructuras", estructuraEnEdicion.id);
        await updateDoc(ref, {
          nombre,
          materiales,
          actualizado: new Date()
        });
        alert("✅ Estructura actualizada correctamente");
        setEstructuraEnEdicion(null); // salir del modo edición
      } else {
        // ➕ Guardar nuevo
        await addDoc(collection(db, "estructuras"), {
          nombre,
          materiales,
          creado: new Date()
        });
        alert("✅ Estructura guardada correctamente");
      }

      setNombre("");
      setMateriales([]);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la estructura");
    }
  };

  return (
    <div className="calculadora-container">
      <h2>{estructuraEnEdicion ? "Editar Estructura" : "Crear Nueva Estructura"}</h2>
      <input
        className="input"
        placeholder="Nombre de la estructura"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <MaterialForm onAgregar={agregarMaterial} />
      <MaterialList materiales={materiales} onEliminar={eliminarMaterial} />
      <div className="acciones">
        {/* ************************************************************************************************* */}
        {/* THIS IS THE CRUCIAL CHANGE FOR THE CLASS NAME                         */}
        {/* ************************************************************************************************* */}
        <button onClick={guardarEstructura} className="btn-guardar-estructura-unica">
          {estructuraEnEdicion ? "Actualizar Estructura" : "Guardar Estructura"}
        </button>
        {estructuraEnEdicion && (
          <button onClick={() => {
            setEstructuraEnEdicion(null);
            setNombre("");
            setMateriales([]);
          }} className="btn-pdf">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default EstructuraForm;