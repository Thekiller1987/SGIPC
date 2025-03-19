import { db } from "../database/firebaseconfig";
import {collection,addDoc,getDocs,doc,updateDoc,deleteDoc,} from "firebase/firestore";

/**
 * Crea un nuevo proyecto en Firestore, guardando las imágenes como cadenas Base64.
 * @param {Object} projectData - Datos del proyecto (nombre, descripción, etc.).
 * @param {string[]} base64Files - Arreglo de strings Base64 de las imágenes.
 * @returns {string} - El ID del documento creado en Firestore.
 */
export const createProject = async (projectData, base64Files) => {
  const newProject = {
    ...projectData,
    documentos: base64Files || [], // Guarda las cadenas Base64 o un array vacío
    createdAt: new Date(),
  };
  const docRef = await addDoc(collection(db, "projects"), newProject);
  return docRef.id;
};

/**
 * Obtiene todos los proyectos de la colección "projects" en Firestore.
 * @returns {Array} - Arreglo con los documentos de proyectos.
 */
export const getProjects = async () => {
  const querySnapshot = await getDocs(collection(db, "projects"));
  let projects = [];
  querySnapshot.forEach((docu) => {
    projects.push({ id: docu.id, ...docu.data() });
  });
  return projects;
};

/**
 * Actualiza un proyecto existente en Firestore, opcionalmente reemplazando
 * las imágenes (cadenas Base64).
 * @param {string} projectId - ID del documento en Firestore a actualizar.
 * @param {Object} projectData - Datos del proyecto (nombre, descripción, etc.).
 * @param {string[]} base64Files - Arreglo de strings Base64 para reemplazar documentos.
 */
export const updateProject = async (projectId, projectData, base64Files) => {
  if (base64Files && base64Files.length > 0) {
    projectData.documentos = base64Files;
  }
  const projectDocRef = doc(db, "projects", projectId);
  await updateDoc(projectDocRef, projectData);
};

/**
 * Elimina un proyecto de Firestore.
 * @param {string} projectId - ID del documento en Firestore a eliminar.
 */
export const deleteProject = async (projectId) => {
  const projectDocRef = doc(db, "projects", projectId);
  await deleteDoc(projectDocRef);
};
