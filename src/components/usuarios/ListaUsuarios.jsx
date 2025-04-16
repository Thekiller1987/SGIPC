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
    if (confirm('¿Deseas eliminar este usuario?')) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  return (
    <div className="usuarios-tabla">
      {!mostrarTabla && (
        <button className="btn-ver-lista" onClick={() => setMostrarTabla(true)}>
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
          <h2>Lista de Usuarios</h2>
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
                      <button onClick={() => setUsuarioEnEdicion(u)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => handleEliminar(u.id)}>Eliminar</button>
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
