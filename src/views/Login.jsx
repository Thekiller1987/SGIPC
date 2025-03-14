import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import { appfirebase } from "../database/firebaseconfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../database/authcontext";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth(appfirebase);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuario autenticado");
      navigate("/inicio");
    } catch (err) {
      console.error("Error de autenticación:", err);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Formato de correo electrónico inválido.");
          break;
        case "auth/user-disabled":
          setError("Esta cuenta de usuario ha sido deshabilitada.");
          break;
        case "auth/user-not-found":
          setError("Usuario no encontrado. Verifica tus credenciales.");
          break;
        case "auth/wrong-password":
          setError("Contraseña incorrecta. Verifica tus credenciales.");
          break;
        case "auth/too-many-requests":
          setError(
            "Demasiados intentos fallidos. Inténtalo de nuevo más tarde."
          );
          break;
        default:
          setError("Error de autenticación. Verifica tus credenciales.");
      }
    }
  };

  if (user) {
    navigate("/inicio");
  }

  return (
    <Container className="d-flex vh-100 justify-content-center align-items-center">
      <Card style={{ width: "25rem" }} className="p-4">
        <Card.Body>
          <Card.Title className="text-center mb-4">Iniciar Sesión</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Iniciar Sesión
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;