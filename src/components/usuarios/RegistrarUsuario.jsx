// src/components/usuarios/RegistrarUsuario.jsx
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';

const RegistrarUsuario = ({ modoEdicion = false, datosUsuario = {}, onGuardar }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('lector');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const db = getFirestore();

  useEffect(() => {
    if (modoEdicion && datosUsuario) {
      setNombre(datosUsuario.nombre || '');
      setApellido(datosUsuario.apellido || '');
      setTelefono(datosUsuario.telefono || '');
      setFechaNacimiento(datosUsuario.fechaNacimiento || '');
      setCorreo(datosUsuario.correo || '');
      setRol(datosUsuario.rol || 'lector');
    }
  }, [modoEdicion, datosUsuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      if (modoEdicion) {
        await updateDoc(doc(db, 'users', datosUsuario.id), {
          nombre, apellido, telefono, fechaNacimiento, correo, rol,
        });
        setMensaje('✅ Usuario actualizado.');
        if (onGuardar) onGuardar();
      } else {
        const newId = `${Date.now()}`;
        await setDoc(doc(db, 'users', newId), {
          nombre, apellido, telefono, fechaNacimiento, correo, rol,
        });
        setMensaje('✅ Usuario registrado.');
        setNombre('');
        setApellido('');
        setTelefono('');
        setFechaNacimiento('');
        setCorreo('');
        setRol('lector');
      }
    } catch {
      setError('❌ Error al guardar. Verifica los campos.');
    }
  };

  return (
    <div className="usuarios-card">
      <form className="usuarios-form" onSubmit={handleSubmit}>
        <h2>{modoEdicion ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h2>
        {mensaje && <p className="success-message">{mensaje}</p>}
        {error && <p className="error-message">{error}</p>}

        <label>Nombre:</label>
        <input placeholder="Ej: Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Apellido:</label>
        <input placeholder="Ej: Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} required />

        <label>Teléfono:</label>
        <input placeholder="Ej: 88888888" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

        <label>Fecha de nacimiento:</label>
        <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />

        <label>Correo electrónico:</label>
        <input placeholder="Ej: correo@dominio.com" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

        <label>Rol:</label>
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="lector">Lector</option>
          <option value="administrador">Administrador</option>
          <option value="ingeniero">Ingeniero</option>
          <option value="contador">Contador</option>
        </select>

        <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar Usuario'}</button>
      </form>
    </div>
  );
};

export default RegistrarUsuario;
