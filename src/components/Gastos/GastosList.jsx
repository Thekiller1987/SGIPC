// src/components/GastosList.jsx
import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { getGastos, deleteGasto } from "../../services/gastosService";

const GastosList = ({ projectId }) => {
  const [gastos, setGastos] = useState([]);

  const fetchGastos = async () => {
    try {
      const data = await getGastos(projectId); // filtra por projectId
      setGastos(data);
    } catch (err) {
      console.error("Error al obtener gastos:", err);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [projectId]);

  const handleDelete = async (id) => {
    try {
      await deleteGasto(id);
      fetchGastos();
    } catch (err) {
      console.error("Error al eliminar gasto:", err);
    }
  };

  return (
    <div>
      <h3>Lista de Gastos</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre Gasto</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Factura Adjunta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id}>
              <td>{g.nombreGasto}</td>
              <td>{g.categoria}</td>
              <td>{g.fecha || "Sin fecha"}</td>
              <td>{g.monto}</td>
              <td>
                {g.facturaBase64 ? (
                  <a href={g.facturaBase64} target="_blank" rel="noreferrer">
                    Ver Factura
                  </a>
                ) : (
                  "No adjunta"
                )}
              </td>
              <td>
                {/* Botón para eliminar */}
                <Button variant="danger" size="sm" onClick={() => handleDelete(g.id)}>
                  Eliminar
                </Button>
                {/* Aquí podrías agregar un botón "Editar" si lo deseas */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default GastosList;
