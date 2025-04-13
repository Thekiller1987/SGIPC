import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

// ✅ Crear gasto
export const createGasto = async (gastoData) => {
  const docRef = await addDoc(collection(db, "gastos"), {
    ...gastoData,
    createdAt: new Date(),
  });
  return docRef.id;
};

// ✅ Obtener gastos filtrados por proyecto
export const getGastos = async (projectId) => {
  let q;
  if (projectId) {
    q = query(collection(db, "gastos"), where("projectId", "==", projectId));
  } else {
    q = collection(db, "gastos");
  }
  const querySnapshot = await getDocs(q);
  let gastos = [];
  querySnapshot.forEach((docu) => {
    gastos.push({ id: docu.id, ...docu.data() });
  });
  return gastos;
};

// ✅ Actualizar gasto con fecha de edición
export const updateGasto = async (gastoId, gastoData) => {
  const gastoDoc = doc(db, "gastos", gastoId);
  await updateDoc(gastoDoc, {
    ...gastoData,
    updatedAt: new Date(), // Se guarda cuándo fue editado
  });
};

// ✅ Eliminar gasto
export const deleteGasto = async (gastoId) => {
  const gastoDoc = doc(db, "gastos", gastoId);
  await deleteDoc(gastoDoc);
};
