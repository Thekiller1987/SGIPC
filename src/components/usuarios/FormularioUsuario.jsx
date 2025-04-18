import React, { useEffect, useState } from "react";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const FormularioUsuario = ({ usuario = null, cerrarFormulario }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rol, setRol] = useState("lector");
  const db = getFirestore();

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setApellido(usuario.apellido || "");
      setCorreo(usuario.correo || "");
      setTelefono(usuario.telefono || "");
      setFechaNacimiento(usuario.fechaNacimiento || "");
      setRol(usuario.rol || "lector");
    }
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuarioData = {
      nombre,
      apellido,
      correo,
      telefono,
      fechaNacimiento,
      rol,
    };

    try {
      if (usuario) {
        await updateDoc(doc(db, "users", usuario.id), usuarioData);
      } else {
        const id = uuidv4();
        await setDoc(doc(db, "users", id), usuarioData);
      }
      cerrarFormulario();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  return (
    <div className="modal-form">
      <form className="formulario-usuario" onSubmit={handleSubmit}>
        <h2>{usuario ? "Editar Usuario" : "Crear Usuario"}</h2>

        <div className="formulario-grid">
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Apellido:</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="input-full">
            <label>Correo:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Teléfono:</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Fecha de nacimiento:</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>

          <div className="input-full">
            <label>Rol:</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="lector">Lector</option>
              <option value="administrador">Administrador</option>
              <option value="ingeniero">Ingeniero</option>
              <option value="contador">Contador</option>
            </select>
          </div>
        </div>

        <div className="formulario-botones">
          <button type="submit" className="btn-guardar">
            Guardar
          </button>
          <button type="button" className="btn-cancelar" onClick={cerrarFormulario}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario;
