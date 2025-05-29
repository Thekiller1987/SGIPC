import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProjectForm from "../../src/views/CreateProjectView"; // Ajusta la ruta
import { createProject } from "../services/projectsService";
import { MemoryRouter } from "react-router-dom";

jest.mock("../services/projectsService", () => ({
  createProject: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

describe("ProjectForm (adaptado a etiquetas sin htmlFor)", () => {
  it("crea un nuevo proyecto con todos los campos obligatorios", async () => {
    const { container } = render(<ProjectForm />, { wrapper: MemoryRouter });

    // Campos de texto
    const inputs = container.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "Proyecto Test" } }); // nombre
    fireEvent.change(inputs[1], { target: { value: "Descripción de prueba" } }); // descripcion
    fireEvent.change(inputs[2], { target: { value: "Cliente Ejemplo" } }); // cliente

    // Campo numérico
    const presupuestoInput = container.querySelector("input[type='number']");
    fireEvent.change(presupuestoInput, { target: { value: "50000" } });

    // Campos de fecha
    const dateInputs = container.querySelectorAll("input[type='date']");
    fireEvent.change(dateInputs[0], { target: { value: "2025-06-01" } }); // fechaInicio
    fireEvent.change(dateInputs[1], { target: { value: "2025-06-30" } }); // fechaFin

    // Click en botón Agregar
    const agregarButton = screen.getByText(/Agregar/i);
    fireEvent.click(agregarButton);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledTimes(1);
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Proyecto Test",
        descripcion: "Descripción de prueba",
        cliente: "Cliente Ejemplo",
        presupuesto: 50000,
        estado: "En progreso",
        fechaInicio: expect.any(Date),
        fechaFin: expect.any(Date),
        imagen: null
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/proyecto");
  });
});
 
// prueba de subida