import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(() => {
    const stored = localStorage.getItem("project");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (project) {
      localStorage.setItem("project", JSON.stringify(project));
    }
  }, [project]);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
