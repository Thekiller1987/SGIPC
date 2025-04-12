import React, { useEffect, useState } from "react";
import "../ProveedoresCss/ProyectosOverview.css";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../services/projectsService";
import { useProject } from "../context/ProjectContext";
import flechaIcon from "../assets/iconos/Flech.png";
import estrellaIcon from "../assets/iconos/star.png";
import iconoBuscar from "../assets/iconos/search.png";

const ProyectosOverview = () => {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setProject } = useProject();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error al cargar proyectos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const text = e.target.value.toLowerCase();
    setSearch(text);
    setFiltered(
      projects.filter((proj) => {
        const nombre = proj.nombre?.toLowerCase() || "";
        const cliente = proj.cliente?.toLowerCase() || "";
        const fecha = proj.createdAt?.seconds
          ? new Date(proj.createdAt.seconds * 1000).toLocaleDateString(
              "es-ES",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )
          : "";
        return (
          nombre.includes(text) ||
          cliente.includes(text) ||
          fecha.includes(text)
        );
      })
    );
  };

  const contarPorEstado = (estado) =>
    projects.filter((p) => p.estado === estado).length;

  const handleNuevoProyecto = () => {
    navigate("/CrearProyecto");
  };

  const handleAbrirDashboard = (project) => {
    setProject(project);
    navigate("/project-dashboard");
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="pantalla-carga">
        <div className="wave-loader">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <p className="texto-cargando">Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <div className="layout-proyectos">
      <h1 className="titulo-proyectos">Proyectos</h1>

      <div className="filtros-proyectos">
        <button className="btn-filtro">
          Proyectos Cancelados <span>{contarPorEstado("Cancelado")}</span>
        </button>
        <button className="btn-filtro">
          Proyectos Terminado <span>{contarPorEstado("Finalizado")}</span>
        </button>
        <button className="btn-filtro">
          Proyectos Proceso <span>{contarPorEstado("En progreso")}</span>
        </button>
      </div>

      <div className="card-blanca-proyectos">
        <div className="barra-superior">
          <div className="input-con-icono">
            <img
              src={iconoBuscar}
              alt="Buscar"
              className="icono-dentro-input"
            />
            <input
              type="text"
              className="input-busqueda"
              placeholder="Buscar proyecto..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button className="btn-nuevo" onClick={handleNuevoProyecto}>
            Nuevo proyecto +
          </button>
        </div>

        <div className="lista-proyectos">
          {filtered.map((project, index) => {
            const fechaFormateada = project.createdAt?.seconds
              ? new Date(project.createdAt.seconds * 1000)
                  .toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  .replace(/^\w/, (c) => c.toUpperCase())
              : "fecha desconocida";

            return (
              <div
                key={index}
                className="card-proyecto clickable-card"
                onClick={() => handleAbrirDashboard(project)}
              >
                <div className="fila-principal">
                  {project.imagen ? (
                    <img
                      src={project.imagen}
                      alt="Proyecto"
                      className="icono-imagen"
                    />
                  ) : (
                    <div className="icono-imagen-placeholder" />
                  )}
                  <div className="bloque-informacion">
                    <p className="nombre-proyecto">{project.nombre}</p>
                    <div className="info-centro">
                      <p className="propiedad-proyecto">
                        Propiedad de {project.cliente || "XXXXXX"}
                      </p>
                      <p className="fecha-proyecto">
                        Creado el {fechaFormateada}
                      </p>
                    </div>
                  </div>
                  <div className="acciones-proyecto">
                    <img
                      src={estrellaIcon}
                      alt="Favorito"
                      className="icono-personalizado"
                    />
                    <img
                      src={flechaIcon}
                      alt="Ver proyecto"
                      className="icono-personalizado"
                      onClick={() => handleAbrirDashboard(project)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProyectosOverview;
