import React from "react";

const MaterialList = ({ materiales, onEliminar }) => {
  return (
    <div className="lista-materiales">
      {materiales.map((mat, index) => (
        <div key={index} className="material-item">
          {mat.imagen && (
            <img src={mat.imagen} alt={mat.nombre} className="imagen-mini" />
          )}
          <div>
            <strong>{mat.nombre}</strong> ({mat.unidad})<br />
            Costo unitario: C${mat.precio} × {mat.cantidad} = <b>C${(mat.precio * mat.cantidad).toFixed(2)}</b>
          </div>
          <button onClick={() => onEliminar(index)} className="btn-eliminar">❌</button>
        </div>
      ))}
    </div>
  );
};

export default MaterialList;