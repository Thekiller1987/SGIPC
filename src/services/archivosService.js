import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

/**
 * Crea un nuevo archivo en el proyecto especificado.
 * @param {string} projectId - ID del proyecto en Firestore.
 * @param {Object} archivoData - Datos del archivo (nombre, tipo, fecha, etc.).
 * @returns {string} - ID del nuevo archivo.
 */
export const createArchivo = async (projectId, archivoData) => {
  const archivoRef = collection(db, "projects", projectId, "archivos");
  const docRef = await addDoc(archivoRef, {
    ...archivoData,
    createdAt: new Date(),
  });
  return docRef.id;
};

/**
 * Obtiene todos los archivos del proyecto especificado.
 * @param {string} projectId - ID del proyecto en Firestore.
 * @returns {Array} - Arreglo de archivos con sus datos e IDs.
 */
export const getDocumentos = async (projectId) => {
  const archivosRef = collection(db, "projects", projectId, "archivos");

  try {
    const querySnapshot = await getDocs(archivosRef);
    const documentos = [];
    querySnapshot.forEach((docu) => {
      // Verificamos que los datos del documento estén completos
      const data = docu.data();
      if (data.nombre) {
        documentos.push({ id: docu.id, ...data });
      }
    });

    return documentos;
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return []; // Retorna un arreglo vacío si ocurre un error
  }
};

/**
 * Actualiza un archivo dentro de un proyecto.
 * @param {string} projectId - ID del proyecto.
 * @param {string} archivoId - ID del archivo a actualizar.
 * @param {Object} archivoData - Nuevos datos del archivo.
 */
export const updateArchivo = async (projectId, archivoId, archivoData) => {
  const archivoDocRef = doc(db, "projects", projectId, "archivos", archivoId);
  await updateDoc(archivoDocRef, archivoData);
};

/**
 * Elimina un archivo de un proyecto.
 * @param {string} projectId - ID del proyecto.
 * @param {string} archivoId - ID del archivo a eliminar.
 */
export const deleteArchivo = async (projectId, archivoId) => {
  const archivoDocRef = doc(db, "projects", projectId, "archivos", archivoId);
  await deleteDoc(archivoDocRef);
};
