import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { appfirebase } from "../database/firebaseconfig";
import "../logincss/LoginRegister.css";

const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  const clearFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/inicio");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("⚠ Contraseña incorrecta.");
      } else if (err.code === "auth/user-not-found") {
        setError("⚠ Usuario no encontrado.");
      } else {
        setError("⚠ Error al iniciar sesión.");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      return setError("⚠ Todos los campos son obligatorios.");
    }

    if (password !== confirmPassword) {
      return setError("⚠ Las contraseñas no coinciden.");
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccessMessage("✅ Registro exitoso");
      setTimeout(() => {
        setSuccessMessage("");
        handleToggleFlip(false); // volver a login
      }, 2000);
    } catch (err) {
      setError("⚠ Error al registrarse: " + err.message);
    }
  };

  return (
    <div className={`login-container ${isFlipped ? "flipped" : ""}`}>
      {/* Mensaje flotante de éxito */}
      {successMessage && (
        <div className="popup-success">{successMessage}</div>
      )}

      <div className="form-toggle mb-4">
        <span
          className={!isFlipped ? "activo" : ""}
          onClick={() => handleToggleFlip(false)}
        >
          Iniciar Sesión
        </span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isFlipped}
            onChange={() => handleToggleFlip(!isFlipped)}
          />
          <span className="slider" />
        </label>
        <span
          className={isFlipped ? "activo" : ""}
          onClick={() => handleToggleFlip(true)}
        >
          Registrarse
        </span>
      </div>

      <div className="card-login">
        <div className="card-login-inner">
          {/* Iniciar Sesión */}
          <div className="card-front">
            <h2 className="titulo-formulario">Iniciar Sesión</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="input-icon">
                <span className="icon">📧</span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-formulario">
                Iniciar Sesión
              </button>
            </form>
          </div>

          {/* Registrarse */}
          <div className="card-back">
            <h2 className="titulo-formulario">Registrarse</h2>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleRegister}>
              <div className="input-icon">
                <span className="icon">📧</span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-icon">
                <span className="icon">🔁</span>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-formulario">
                Registrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
