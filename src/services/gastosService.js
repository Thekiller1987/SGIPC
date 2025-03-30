// src/services/gastosService.js
import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

/**
 * Crea un nuevo gasto en la colección "gastos"
 * @param {Object} gastoData - { projectId, nombreGasto, categoria, fecha, monto, facturaBase64 }
 */
export const createGasto = async (gastoData) => {
  const docRef = await addDoc(collection(db, "gastos"), {
    ...gastoData,
    createdAt: new Date(),
  });
  return docRef.id;
};

/**
 * Obtiene todos los gastos, o solo los de un proyecto si pasas un projectId
 * @param {string} [projectId] - Opcional, filtra por proyecto
 */
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

/**
 * Actualiza un gasto
 * @param {string} gastoId
 * @param {Object} gastoData
 */
export const updateGasto = async (gastoId, gastoData) => {
  const gastoDoc = doc(db, "gastos", gastoId);
  await updateDoc(gastoDoc, gastoData);
};

/**
 * Elimina un gasto
 * @param {string} gastoId
 */
export const deleteGasto = async (gastoId) => {
  const gastoDoc = doc(db, "gastos", gastoId);
  await deleteDoc(gastoDoc);
};
