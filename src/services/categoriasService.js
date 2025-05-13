import { db } from "../database/firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ✅ Obtener categorías por proyecto
export const getCategoriasPorProyecto = async (projectId) => {
  const ref = doc(db, "categorias", projectId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().lista || [];
  } else {
    return ["Materiales", "Mano de obra", "Transporte"];
  }
};

// ✅ Guardar nueva categoría en Firestore
export const guardarNuevaCategoria = async (projectId, nuevaCategoria) => {
  const ref = doc(db, "categorias", projectId);
  const snap = await getDoc(ref);

  let categorias = ["Materiales", "Mano de obra", "Transporte"];
  if (snap.exists()) {
    categorias = snap.data().lista || categorias;
  }

  if (!categorias.includes(nuevaCategoria)) {
    categorias.push(nuevaCategoria);
    await setDoc(ref, { lista: categorias });
  }

  return categorias;
};
