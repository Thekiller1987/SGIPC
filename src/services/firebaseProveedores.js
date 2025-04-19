// firebaseProveedores.js
import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const coleccion = collection(db, "proveedores");

// Crear proveedor
export const guardarProveedor = async (proveedor) => {
  await addDoc(coleccion, proveedor);
};

// Obtener proveedores filtrados por proyecto
export const obtenerProveedores = async (idProyecto) => {
  const q = query(coleccion, where("proyectoId", "==", idProyecto));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const eliminarProveedor = async (id) => {
  const ref = doc(db, "proveedores", id);
  await deleteDoc(ref);
};

export const actualizarProveedor = async (id, datosActualizados) => {
  const ref = doc(db, "proveedores", id);
  await updateDoc(ref, datosActualizados);
};
