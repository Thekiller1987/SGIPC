import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import FormularioUsuario from './FormularioUsuario';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    if (!mostrarTabla) return;

    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
    });

    return () => unsub();
  }, [mostrarTabla]);

  const handleEliminar = async (id) => {
    if (window.confirm('¿Deseas eliminar este usuario?')) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  return (
    <div className="usuarios-container">
      {!mostrarTabla && (
        <button className="btn-crear" onClick={() => setMostrarTabla(true)}>
          Ver Lista de Usuarios
        </button>
      )}

      {usuarioEnEdicion && (
        <FormularioUsuario
          usuario={usuarioEnEdicion}
          cerrarFormulario={() => setUsuarioEnEdicion(null)}
        />
      )}

      {mostrarTabla && (
        <>
          <h1>Gestión de Usuarios</h1>
          <div className="tabla-contenedor">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.apellido}</td>
                    <td>{u.correo}</td>
                    <td>{u.telefono}</td>
                    <td>{u.rol}</td>
                    <td>
                      <div className="usuarios-iconos">
                        <button onClick={() => setUsuarioEnEdicion(u)}>
                          <img src="/iconos/edit.png" alt="Editar" />
                        </button>
                        <button onClick={() => handleEliminar(u.id)}>
                          <img src="/iconos/delete.png" alt="Eliminar" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ListaUsuarios;
