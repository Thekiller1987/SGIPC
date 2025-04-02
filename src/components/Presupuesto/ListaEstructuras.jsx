import React, { useEffect, useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";

const ListaEstructuras = ({ setEstructuraEnEdicion }) => {
  const [estructuras, setEstructuras] = useState([]);
  const [estructuraAEliminar, setEstructuraAEliminar] = useState(null);

  const cargarEstructuras = async () => {
    const snapshot = await getDocs(collection(db, "estructuras"));
    setEstructuras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const confirmarEliminar = (estructura) => {
    setEstructuraAEliminar(estructura);
  };

  const eliminarEstructura = async () => {
    await deleteDoc(doc(db, "estructuras", estructuraAEliminar.id));
    setEstructuras(prev => prev.filter(e => e.id !== estructuraAEliminar.id));
    setEstructuraAEliminar(null);
  };

  useEffect(() => {
    cargarEstructuras();
  }, []);

  return (
    <div className="lista-estructuras">
      <h2 className="subtitulo">Estructuras guardadas</h2>

      {estructuras.length === 0 ? (
        <p style={{ color: "#ccc" }}>No hay estructuras registradas.</p>
      ) : (
        <div className="tabla-container">
          <table className="tabla-estructuras">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Materiales</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estructuras.map((est) => (
                <tr key={est.id}>
                  <td>{est.nombre}</td>
                  <td>{est.materiales.length}</td>
                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => setEstructuraEnEdicion(est)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => confirmarEliminar(est)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {estructuraAEliminar && (
        <ConfirmPopup
          mensaje={`¿Seguro que deseas eliminar "${estructuraAEliminar.nombre}"?`}
          onConfirmar={eliminarEstructura}
          onCancelar={() => setEstructuraAEliminar(null)}
        />
      )}
    </div>
  );
};

export default ListaEstructuras;
