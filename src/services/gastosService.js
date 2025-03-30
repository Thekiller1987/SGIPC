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

export const createGasto = async (gastoData) => {
  const docRef = await addDoc(collection(db, "gastos"), {
    ...gastoData,
    createdAt: new Date(),
  });
  return docRef.id;
};

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

export const updateGasto = async (gastoId, gastoData) => {
  const gastoDoc = doc(db, "gastos", gastoId);
  await updateDoc(gastoDoc, gastoData);
};

export const deleteGasto = async (gastoId) => {
  const gastoDoc = doc(db, "gastos", gastoId);
  await deleteDoc(gastoDoc);
};
