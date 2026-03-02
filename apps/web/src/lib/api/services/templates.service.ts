import { apiClient } from '../client';
import type { Template } from '@documentifyit/shared';

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  content?: Record<string, unknown>;
  isAi?: boolean;
}

export const templatesService = {
  async findAll(): Promise<Template[]> {
    const res = await apiClient.get<Template[]>('/templates');
    return res.data;
  },

  async findById(id: string): Promise<Template> {
    const res = await apiClient.get<Template>(`/templates/${id}`);
    return res.data;
  },

  async create(data: CreateTemplateRequest): Promise<Template> {
    const res = await apiClient.post<Template>('/templates', data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/templates/${id}`);
  },
};
