import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { createGasto } from "../../services/gastosService";


const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const GastosForm = ({ projectId, onGastoCreated }) => {
  // Estado para el tipo de transacción: "gasto" o "ingreso"
  const [tipo, setTipo] = useState("");
  // Usamos este campo para la categoría cuando el tipo es "gasto"
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [facturaBase64, setFacturaBase64] = useState(null);
  const [error, setError] = useState(null);
  
  // Categorías por defecto para gastos, inicializadas desde localStorage o con valores predeterminados.
  const [defaultCategorias, setDefaultCategorias] = useState(() => {
    const storedCategorias = localStorage.getItem("defaultCategorias");
    return storedCategorias
      ? JSON.parse(storedCategorias)
      : ["Materiales", "Mano de obra", "Transporte"];
  });
  
  // Estados para manejar la adición de una nueva categoría
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setFacturaBase64(base64);
    } catch (err) {
      console.error("Error al convertir archivo a Base64:", err);
      setError("No se pudo procesar la factura adjunta.");
    }
  };

  // Al cambiar la categoría en el select, si se elige la opción "nueva" mostramos el input para agregarla.
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

  // Función para agregar la nueva categoría a la lista y guardarla en localStorage
  const handleAddNewCategory = () => {
    if (newCategory.trim() && !defaultCategorias.includes(newCategory)) {
      const updatedCategories = [...defaultCategorias, newCategory];
      setDefaultCategorias(updatedCategories);
      localStorage.setItem("defaultCategorias", JSON.stringify(updatedCategories));
      setCategoria(newCategory);
      setShowNewCategory(false);
      setNewCategory("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Si es gasto y no se ha definido una categoría, mostramos un error.
    if (tipo === "gasto" && !categoria) {
      setError("Debe seleccionar o agregar una categoría para gastos.");
      return;
    }

    try {
      // Se arma el objeto de datos. En ingresos, no se envían categoría ni factura.
      const gastoData = {
        projectId,
        tipo,
        ...(tipo === "gasto" && { categoria }),
        fecha: fecha || null,
        monto: Number(monto),
        ...(tipo === "gasto" && { facturaBase64 }),
      };

      const gastoId = await createGasto(gastoData);
      if (onGastoCreated) onGastoCreated(gastoId);

      // Reinicia el formulario
      setTipo("");
      setCategoria("");
      setFecha("");
      setMonto("");
      setFacturaBase64(null);
      setShowNewCategory(false);
      setNewCategory("");
    } catch (err) {
      console.error("Error al crear transacción:", err);
      setError("No se pudo crear el registro.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Selección del tipo de transacción */}
      <Form.Group className="mb-3" controlId="tipo">
        <Form.Label>Tipo de Transacción</Form.Label>
        <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Seleccione...</option>
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </Form.Select>
      </Form.Group>

      {/* Para transacciones de tipo "gasto" mostramos el combobox para seleccionar categoría */}
      {tipo === "gasto" && (
        <>
          <Form.Group className="mb-3" controlId="categoria">
            <Form.Label>Categoría de Gasto</Form.Label>
            <Form.Select value={categoria} onChange={handleCategoriaChange}>
              <option value="">Seleccione...</option>
              {defaultCategorias.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="nueva">-- Agregar nueva categoría --</option>
            </Form.Select>
          </Form.Group>

          {/* Si se eligió agregar nueva categoría, se muestra un campo para ingresarla */}
          {showNewCategory && (
            <Form.Group className="mb-3" controlId="nuevaCategoria">
              <Form.Label>Nueva Categoría</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la nueva categoría"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={handleAddNewCategory}
                className="mt-2"
              >
                Agregar Categoría
              </Button>
            </Form.Group>
          )}
        </>
      )}

      {/* Los siguientes campos se muestran para ambos tipos */}
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

      {/* Solo para gastos se permite adjuntar factura */}
      {tipo === "gasto" && (
        <Form.Group className="mb-3" controlId="factura">
          <Form.Label>Factura Adjunta</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
      )}

      <Button variant="primary" type="submit">
        Agregar Registro
      </Button>
    </Form>
  );
};

export default GastosForm;
