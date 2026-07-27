import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Project, projectService } from '../services/project.service';

const ACTIVE_PROJECT_KEY = 'active_project_id';

interface ProjectContextValue {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  selectProject: (project: Project | string) => void;
  refreshProjects: (preferredId?: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const ProjectProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_PROJECT_KEY),
  );
  const [loading, setLoading] = useState(false);

  const refreshProjects = useCallback(async (preferredId?: string) => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      setActiveProjectId((current) => {
        const candidate = preferredId || current;
        const nextId = data.some((project) => project.id === candidate)
          ? candidate!
          : data[0]?.id || null;
        if (nextId) localStorage.setItem(ACTIVE_PROJECT_KEY, nextId);
        else localStorage.removeItem(ACTIVE_PROJECT_KEY);
        return nextId;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const selectProject = useCallback((project: Project | string) => {
    const id = typeof project === 'string' ? project : project.id;
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    setActiveProjectId(id);
  }, []);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId],
  );

  return (
    <ProjectContext.Provider value={{ projects, activeProject, loading, selectProject, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used inside ProjectProvider');
  return context;
};
