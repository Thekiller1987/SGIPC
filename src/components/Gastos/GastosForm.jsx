// src/components/Gastos/GastosForm.jsx
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { createGasto } from "../../services/gastosService";
import "../../GastosCss/GastosForm.css";

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const GastosForm = ({ projectId, onGastoCreated }) => {
  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [facturaBase64, setFacturaBase64] = useState(null);
  const [error, setError] = useState(null);

  const [defaultCategorias, setDefaultCategorias] = useState(() => {
    const stored = localStorage.getItem("defaultCategorias");
    return stored
      ? JSON.parse(stored)
      : ["Materiales", "Mano de obra", "Transporte"];
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setFacturaBase64(base64);
    } catch {
      setError("No se pudo procesar la factura.");
    }
  };

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "nueva") {
      setShowNewCategory(true);
      setCategoria("");
    } else {
      setCategoria(value);
      setShowNewCategory(false);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !defaultCategorias.includes(newCategory)) {
      const updated = [...defaultCategorias, newCategory];
      setDefaultCategorias(updated);
      localStorage.setItem("defaultCategorias", JSON.stringify(updated));
      setCategoria(newCategory);
      setNewCategory("");
      setShowNewCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (tipo === "gasto" && !categoria) {
      return setError("Seleccione o agregue una categoría para gastos.");
    }

    try {
      const gasto = {
        projectId,
        tipo,
        ...(tipo === "gasto" && { categoria }),
        fecha: fecha || null,
        monto: Number(monto),
        ...(tipo === "gasto" && { facturaBase64 }),
      };

      const id = await createGasto(gasto);
      if (onGastoCreated) onGastoCreated(id);

      setTipo("");
      setCategoria("");
      setFecha("");
      setMonto("");
      setFacturaBase64(null);
      setNewCategory("");
      setShowNewCategory(false);
    } catch {
      setError("No se pudo crear el registro.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" controlId="tipo">
        <Form.Label>Tipo de Transacción</Form.Label>
        <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Seleccione...</option>
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </Form.Select>
      </Form.Group>

      {tipo === "gasto" && (
        <>
          <Form.Group className="mb-3" controlId="categoria">
            <Form.Label>Categoría de Gasto</Form.Label>
            <Form.Select value={categoria} onChange={handleCategoriaChange}>
              <option value="">Seleccione...</option>
              {defaultCategorias.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="nueva">-- Agregar nueva categoría --</option>
            </Form.Select>
          </Form.Group>

          {showNewCategory && (
            <Form.Group className="mb-3" controlId="nuevaCategoria">
              <Form.Label>Nueva Categoría</Form.Label>
              <Form.Control
                type="text"
                value={newCategory}
                placeholder="Ingrese la nueva categoría"
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <div className="btn-agregar-categoria-container">
                <Button
                  onClick={handleAddNewCategory}
                  className="btn-agregar-categoria"
                >
                  Agregar Categoría
                </Button>
              </div>
            </Form.Group>
          )}
        </>
      )}

      <Form.Group className="mb-3" controlId="fecha">
        <Form.Label>Fecha</Form.Label>
        <Form.Control
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="monto">
        <Form.Label>Monto</Form.Label>
        <Form.Control
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </Form.Group>

      {tipo === "gasto" && (
        <Form.Group className="mb-3" controlId="factura">
          <Form.Label>Factura Adjunta</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
      )}

      <div className="btn-agregar-container">
        <Button type="submit" className="btn-agregar-registro">
          Agregar Registro
        </Button>
      </div>
    </Form>
  );
};

export default GastosForm;
