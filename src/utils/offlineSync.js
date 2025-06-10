// src/utils/offlineSync.js
import { createProject } from "../services/projectsService";

export const syncOfflineProjects = () => {
  const offlineProject = localStorage.getItem("offlineProject");
  if (offlineProject) {
    const projectData = JSON.parse(offlineProject);
    createProject(projectData)
      .then(() => {
        console.log("Proyecto sincronizado correctamente");
        localStorage.removeItem("offlineProject");
      })
      .catch((err) => {
        console.error("Error al sincronizar proyecto:", err);
      });
  }
};
