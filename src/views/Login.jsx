// Login.jsx actualizado con campos extra y logíca basada en Firestore
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { appfirebase } from "../database/firebaseconfig";
import "../logincss/LoginRegister.css";

const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);
  const db = getFirestore();

  const clearFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNombre("");
    setApellido("");
    setTelefono("");
    setError(null);
  };

  const handleToggleFlip = (flipState) => {
    setIsFlipped(flipState);
    clearFields();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const rol = userData.rol;

        // Redirección según rol
        if (rol === "lector") navigate("/inicio");
        else if (rol === "contador") navigate("/gastos-overview");
        else if (rol === "ingeniero") navigate("/inicio");
        else if (rol === "administrador") navigate("/inicio");
        else navigate("/inicio"); // Por defecto
      } else {
        setError("⚠ Usuario no registrado en la base de datos.");
      }
    } catch (err) {
      setError("⚠ Error al iniciar sesión: " + err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword || !nombre || !apellido || !telefono) {
      return setError("⚠ Todos los campos son obligatorios.");
    }

    if (password !== confirmPassword) {
      return setError("⚠ Las contraseñas no coinciden.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), {
        uid,
        nombre,
        apellido,
        correo: email,
        telefono,
        rol: "lector"
      });
      setSuccessMessage("✅ Registro exitoso");
      setTimeout(() => {
        setSuccessMessage("");
        handleToggleFlip(false);
      }, 2000);
    } catch (err) {
      setError("⚠ Error al registrarse: " + err.message);
    }
  };

  return (
    <div className={`login-container ${isFlipped ? "flipped" : ""}`}>
      {successMessage && <div className="popup-success">{successMessage}</div>}

      <div className="form-toggle mb-4">
        <span className={!isFlipped ? "activo" : ""} onClick={() => handleToggleFlip(false)}>Iniciar Sesión</span>
        <label className="switch">
          <input type="checkbox" checked={isFlipped} onChange={() => handleToggleFlip(!isFlipped)} />
          <span className="slider" />
        </label>
        <span className={isFlipped ? "activo" : ""} onClick={() => handleToggleFlip(true)}>Registrarse</span>
      </div>

      <div className="card-login">
        <div className="card-login-inner">
          {/* Iniciar Sesion */}
          <div className="card-front">
            <h2 className="titulo-formulario">Iniciar Sesión</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="input-icon">
                <span className="icon">📧</span>
                <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-formulario">Iniciar Sesión</button>
            </form>
          </div>

          {/* Registro */}
          <div className="card-back">
            <h2 className="titulo-formulario">Registrarse</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleRegister}>
              <div className="input-icon">
                <span className="icon">👤</span>
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="input-icon">
                <span className="icon">👥</span>
                <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
              </div>
              <div className="input-icon">
                <span className="icon">📧</span>
                <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="input-icon">
                <span className="icon">📱</span>
                <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              </div>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="input-icon">
                <span className="icon">🔁</span>
                <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-formulario">Registrar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
