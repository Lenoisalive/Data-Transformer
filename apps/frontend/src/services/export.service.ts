import axios from 'axios';

export interface ExportTable {
  id: string;
  name: string;
  format: 'csv' | 'excel' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  schema: {
    columns: Array<{
      name: string;
      type: string;
    }>;
  };
  data: any[];
  rowCount: number;
  projectId?: string;
  ownerId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExportTablePayload {
  name: string;
  format: 'csv' | 'excel' | 'json';
  schema: Array<{
    name: string;
    type: string;
  }>;
  data: any[];
  description?: string;
  projectId?: string;
}

class ExportTableService {
  private baseURL = '/api/export';

  async create(payload: CreateExportTablePayload): Promise<ExportTable> {
    const response = await axios.post(this.baseURL, payload);
    return response.data.data;
  }

  async getAll(projectId?: string): Promise<ExportTable[]> {
    const params = projectId ? { projectId } : {};
    const response = await axios.get(this.baseURL, { params });
    return response.data.data;
  }

  async getOne(id: string): Promise<ExportTable> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data.data;
  }

  async getPreview(id: string, limit: number = 100): Promise<any[]> {
    const response = await axios.get(`${this.baseURL}/${id}/preview`, {
      params: { limit },
    });
    return response.data.data;
  }

  async download(id: string, fileName: string): Promise<void> {
    const response = await axios.get(`${this.baseURL}/${id}/download`, {
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async update(id: string, data: Partial<ExportTable>): Promise<ExportTable> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export const exportTableService = new ExportTableService();
