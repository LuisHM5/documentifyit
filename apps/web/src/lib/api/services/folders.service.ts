import { apiClient } from '../client';
import type { Folder } from '@documentifyit/shared';

export interface CreateFolderRequest {
  name: string;
  parentId?: string;
}

export const foldersService = {
  async findAll(): Promise<Folder[]> {
    const res = await apiClient.get<Folder[]>('/folders');
    return res.data;
  },

  async findById(id: string): Promise<Folder> {
    const res = await apiClient.get<Folder>(`/folders/${id}`);
    return res.data;
  },

  async create(data: CreateFolderRequest): Promise<Folder> {
    const res = await apiClient.post<Folder>('/folders', data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/folders/${id}`);
  },
};
