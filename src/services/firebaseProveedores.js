import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// Referencia a la colección
const coleccion = collection(db, "proveedores");

// Crear proveedor
export const guardarProveedor = async (proveedor) => {
  await addDoc(coleccion, proveedor);
};

// Obtener todos los proveedores
export const obtenerProveedores = async () => {
  const snapshot = await getDocs(coleccion);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Eliminar proveedor
export const eliminarProveedor = async (id) => {
  const ref = doc(db, "proveedores", id);
  await deleteDoc(ref);
};

// Actualizar proveedor
export const actualizarProveedor = async (id, datosActualizados) => {
  const ref = doc(db, "proveedores", id);
  await updateDoc(ref, datosActualizados);
};
