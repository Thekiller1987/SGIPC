import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// 🧪 Mocks globales
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({
      state: { project: { id: "mockProjectId" } },
    }),
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../../src/components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock("../../src/assets/iconos/flecha.png", () => "");
jest.mock("../../src/assets/iconos/search.png", () => "");
jest.mock("../../src/Proveedorcss/ProveedorOverview.css", () => ({}));

// 🧪 Mock Firebase
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: (q, callback) => {
    const data = [
      { id: "1", nombre: "Luis", empresa: "Empresa Uno" },
      { id: "2", nombre: "Carlos", empresa: "Servicios Titan" },
    ];
    callback({ docs: data.map((d) => ({ id: d.id, data: () => d })) });
    return () => {};
  },
  getFirestore: jest.fn(() => ({})),
}));

jest.mock("../../src/assets/database/firebaseconfig", () => ({
  db: {},
}));

// Importa después de los mocks
import ProveedoresOverview from "../../src/views/ProveedoresOverview";

describe("🧪 ProveedoresOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Muestra proveedores filtrados por nombre", async () => {
    render(
      <BrowserRouter>
        <ProveedoresOverview />
      </BrowserRouter>
    );

    expect(await screen.findByText("Empresa Uno")).toBeInTheDocument();
    expect(screen.getByText("Servicios Titan")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
      target: { value: "Luis" },
    });

    expect(screen.getByText("Empresa Uno")).toBeInTheDocument();
    expect(screen.queryByText("Servicios Titan")).toBeNull();
  });

  test("Al hacer clic en '+ Agregar Proveedor' navega correctamente", async () => {
    render(
      <BrowserRouter>
        <ProveedoresOverview />
      </BrowserRouter>
    );

    const boton = await screen.findByText("+ Agregar Proveedor");
    fireEvent.click(boton);

    expect(mockNavigate).toHaveBeenCalledWith("/agregar-proveedor", {
      state: { projectId: "mockProjectId" },
    });
  });
});
