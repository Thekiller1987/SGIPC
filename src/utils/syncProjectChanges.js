import { updateProject, deleteProject } from "../services/projectsService";

export const syncOfflineProjectChanges = async () => {
  // 1. Sincronizar actualizaciones
  const updatesRaw = localStorage.getItem("offlineProjectUpdates");
  if (updatesRaw) {
    try {
      const updates = JSON.parse(updatesRaw);
      for (const { id, data } of updates) {
        await updateProject(id, data);
        console.log(`✅ Proyecto ${id} actualizado.`);
      }
      localStorage.removeItem("offlineProjectUpdates");
    } catch (error) {
      console.error("❌ Error al sincronizar actualizaciones:", error);
    }
  }

  // 2. Sincronizar eliminación
  const deletion = localStorage.getItem("offlineProjectDeletion");
  if (deletion) {
    try {
      await deleteProject(deletion);
      localStorage.removeItem("offlineProjectDeletion");
      console.log(`🗑️ Proyecto ${deletion} eliminado.`);
    } catch (error) {
      console.error("❌ Error al sincronizar eliminación:", error);
    }
  }
};
