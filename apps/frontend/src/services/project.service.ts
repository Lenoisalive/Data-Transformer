import axios from 'axios';
import type { DataSource } from './datasource.service';
import type { ExportTable } from './export.service';

const API_URL = '/api/projects';

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: User[];
  tables: ProjectTable[];
  inputTables: DataSource[];
  outputTables: ExportTable[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface ProjectTable {
  id: string;
  projectId: string;
  tableName: string;
  tableType: 'INPUT' | 'OUTPUT';
  datasourceId?: string;
  description?: string;
  schema?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface CreateProjectTableDto {
  tableName: string;
  tableType: 'INPUT' | 'OUTPUT';
  datasourceId?: string;
  description?: string;
  schema?: any;
}

export type ProjectResourceType = 'INPUT' | 'OUTPUT';

export interface AvailableProjectResources {
  inputTables: DataSource[];
  outputTables: ExportTable[];
}

class ProjectService {
  async getProjects(): Promise<Project[]> {
    const response = await axios.get(API_URL);
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await axios.post(API_URL, data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<CreateProjectDto>): Promise<Project> {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }

  async getAvailableResources(): Promise<AvailableProjectResources> {
    const response = await axios.get(`${API_URL}/resources/available`);
    return response.data;
  }

  async attachResource(
    projectId: string,
    resourceType: ProjectResourceType,
    resourceId: string,
  ): Promise<Project> {
    const response = await axios.post(`${API_URL}/${projectId}/resources`, {
      resourceType,
      resourceId,
    });
    return response.data;
  }

  async detachResource(
    projectId: string,
    resourceType: ProjectResourceType,
    resourceId: string,
  ): Promise<Project> {
    const response = await axios.delete(`${API_URL}/${projectId}/resources`, {
      data: { resourceType, resourceId },
    });
    return response.data;
  }

  async getProjectTables(projectId: string): Promise<ProjectTable[]> {
    const response = await axios.get(`${API_URL}/${projectId}/tables`);
    return response.data;
  }

  async addProjectTable(projectId: string, data: CreateProjectTableDto): Promise<ProjectTable> {
    const response = await axios.post(`${API_URL}/${projectId}/tables`, data);
    return response.data;
  }

  async deleteProjectTable(projectId: string, tableId: string): Promise<void> {
    await axios.delete(`${API_URL}/${projectId}/tables/${tableId}`);
  }
}

export const projectService = new ProjectService();
