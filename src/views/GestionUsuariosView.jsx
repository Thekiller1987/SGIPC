import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import FormularioUsuario from "../components/usuarios/FormularioUsuario";
import Sidebar from "../components/Sidebar";
import ConfirmPopup from "../components/ConfirmPopup/ConfirmPopup";
import editIcon from "../assets/iconos/edit.png";
import deleteIcon from "../assets/iconos/delete.png";
import "../GestionUsuarios.css/usuarios.css";

const GestionUsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
    });
    return () => unsubscribe();
  }, []);

  const abrirFormulario = (usuario = null) => {
    setUsuarioSeleccionado(usuario);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setUsuarioSeleccionado(null);
    setMostrarFormulario(false);
  };

  // Mostrar popup personalizado
  const confirmarEliminacion = (id) => {
    setIdAEliminar(id);
    setMostrarPopup(true);
  };

  const handleConfirmarEliminar = async () => {
    if (idAEliminar) {
      await deleteDoc(doc(db, "users", idAEliminar));
      setMostrarPopup(false);
      setIdAEliminar(null);
    }
  };

  const handleCancelarEliminar = () => {
    setMostrarPopup(false);
    setIdAEliminar(null);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="contenido-principal">
        <h1 className="titulo-modulo-izquierda">Gestión de Usuarios</h1>

        <div className="tabla-contenedor">
          <div className="encabezado-tabla"></div>

          <div className="tabla-responsive">
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
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.apellido}</td>
                    <td>{usuario.correo}</td>
                    <td>{usuario.telefono}</td>
                    <td>{usuario.rol}</td>
                    <td>
                      <button className="btn-accion editar" onClick={() => abrirFormulario(usuario)}>
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button className="btn-accion eliminar" onClick={() => confirmarEliminacion(usuario.id)}>
                        <img src={deleteIcon} alt="Eliminar" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {mostrarFormulario && (
          <FormularioUsuario
            usuario={usuarioSeleccionado}
            cerrarFormulario={cerrarFormulario}
          />
        )}

        {mostrarPopup && (
          <ConfirmPopup
            mensaje="¿Estás seguro de eliminar este usuario?"
            onConfirmar={handleConfirmarEliminar}
            onCancelar={handleCancelarEliminar}
          />
        )}
      </div>
    </div>
  );
};

export default GestionUsuariosView;
