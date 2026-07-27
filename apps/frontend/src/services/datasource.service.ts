import axios from 'axios';

const API_BASE_URL = '/api';

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'excel' | 'database' | 'api';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  schema?: {
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      example?: any;
    }>;
  };
  rowCount: number;
  projectId?: string;
  ownerId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDataSourceParams {
  file: File;
  name?: string;
  type: 'csv' | 'excel';
  description?: string;
  projectId?: string;
}

class DatasourceService {
  /**
   * 上传文件并创建数据源
   */
  async uploadFile(params: UploadDataSourceParams): Promise<DataSource> {
    const formData = new FormData();
    formData.append('file', params.file);
    
    if (params.name) {
      formData.append('name', params.name);
    }
    formData.append('type', params.type);
    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.projectId) {
      formData.append('projectId', params.projectId);
    }

    const response = await axios.post(`${API_BASE_URL}/datasources/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  /**
   * 获取所有数据源
   */
  async getAll(projectId?: string): Promise<DataSource[]> {
    const params = projectId ? { projectId } : {};
    const response = await axios.get(`${API_BASE_URL}/datasources`, { params });
    return response.data.data;
  }

  /**
   * 获取单个数据源详情
   */
  async getOne(id: string): Promise<DataSource> {
    const response = await axios.get(`${API_BASE_URL}/datasources/${id}`);
    return response.data.data;
  }

  /**
   * 获取数据源预览数据
   */
  async getPreview(id: string, limit: number = 100): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/datasources/${id}/preview`, {
      params: { limit },
    });
    return response.data.data;
  }

  /**
   * 更新数据源
   */
  async update(id: string, data: Partial<DataSource>): Promise<DataSource> {
    const response = await axios.put(`${API_BASE_URL}/datasources/${id}`, data);
    return response.data.data;
  }

  /**
   * 删除数据源
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/datasources/${id}`);
  }
}

export const datasourceService = new DatasourceService();
export default datasourceService;
