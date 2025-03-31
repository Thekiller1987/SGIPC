import React, { useState } from "react";
import ListaProveedores from "./ListaProveedores";
import FormularioProveedor from "./FormularioProveedor";
import DetalleProveedor from "./DetalleProveedor";

const Proveedores = () => {
  const [vista, setVista] = useState("lista"); // 'lista' | 'agregar' | 'detalle'
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const cambiarVista = (nuevaVista, proveedor = null) => {
    setProveedorSeleccionado(proveedor);
    setVista(nuevaVista);
  };

  return (
    <div>
      {vista === "lista" && (
        <ListaProveedores
          onAgregar={() => cambiarVista("agregar")}
          onSeleccionar={(p) => cambiarVista("detalle", p)}
        />
      )}
      {vista === "agregar" && (
        <FormularioProveedor onCancelar={() => cambiarVista("lista")} />
      )}
      {vista === "detalle" && proveedorSeleccionado && (
        <DetalleProveedor
          proveedor={proveedorSeleccionado}
          onVolver={() => cambiarVista("lista")}
        />
      )}
    </div>
  );
};

export default Proveedores;
