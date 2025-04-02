import React, { useState } from "react";

const MaterialForm = ({ onAgregar, predefinidos = [], estructuras = [], onAgregarEstructura }) => {
  const [material, setMaterial] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    unidad: "m2",
    imagen: ""
  });

  const convertirBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertirBase64(file);
    setMaterial({ ...material, imagen: base64 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({ ...material, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAgregar({
      ...material,
      precio: parseFloat(material.precio),
      cantidad: parseFloat(material.cantidad)
    });
    setMaterial({ nombre: "", precio: "", cantidad: "", unidad: "m2", imagen: "" });
  };

  const handleSeleccionPredefinido = (e) => {
    const seleccionado = predefinidos.find((m) => m.nombre === e.target.value);
    if (seleccionado) setMaterial({ ...seleccionado });
  };

  const handleSeleccionEstructura = (e) => {
    const seleccionada = estructuras.find((est) => est.nombre === e.target.value);
    if (seleccionada) onAgregarEstructura(seleccionada);
  };

  return (
    <form className="formulario-material" onSubmit={handleSubmit}>
      {estructuras.length > 0 && (
        <select onChange={handleSeleccionEstructura} className="dropdown-estructura">
          <option value="">Agregar estructura (ej. Muro)</option>
          {estructuras.map((est, idx) => (
            <option key={idx} value={est.nombre}>{est.nombre}</option>
          ))}
        </select>
      )}
      {predefinidos.length > 0 && (
        <select onChange={handleSeleccionPredefinido} className="dropdown-predefinido">
          <option value="">Seleccionar material predefinido</option>
          {predefinidos.map((mat, idx) => (
            <option key={idx} value={mat.nombre}>{mat.nombre} - C${mat.precio}/{mat.unidad}</option>
          ))}
        </select>
      )}
      <input name="nombre" placeholder="Nombre del material" value={material.nombre} onChange={handleChange} required />
      <input name="precio" type="number" placeholder="Precio unitario" value={material.precio} onChange={handleChange} required />
      <input name="cantidad" type="number" placeholder="Cantidad o m²" value={material.cantidad} onChange={handleChange} required />
      <select name="unidad" value={material.unidad} onChange={handleChange}>
        <option value="m2">m²</option>
        <option value="kg">kg</option>
        <option value="unidad">unidad</option>
        <option value="saco">saco</option>
        <option value="lata">lata</option>
      </select>
      <input type="file" accept="image/*" onChange={handleImagen} />
      <button type="submit">Agregar Material</button>
    </form>
  );
};

export default MaterialForm;