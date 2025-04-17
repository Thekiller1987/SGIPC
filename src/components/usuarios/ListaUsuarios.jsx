import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import RegistrarUsuario from './RegistrarUsuario';

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
    <div className="container-fluid py-4 bg-dark text-white min-vh-100">
      {!mostrarTabla && (
        <button className="btn btn-warning mb-4" onClick={() => setMostrarTabla(true)}>
          Ver Lista de Usuarios
        </button>
      )}

      {usuarioEnEdicion && (
        <RegistrarUsuario
          modoEdicion
          datosUsuario={usuarioEnEdicion}
          onGuardar={() => setUsuarioEnEdicion(null)}
        />
      )}

      {mostrarTabla && (
        <>
          <h1 className="mb-4">Lista de Usuarios</h1>

          <div className="tabla-responsive">
  <table className="tabla-usuarios">
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
            <button className="btn-accion editar">
              <img src="/iconos/edit.png" alt="editar" />
            </button>
            <button className="btn-accion eliminar">
              <img src="/iconos/delete.png" alt="eliminar" />
            </button>
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
