import { apiClient } from '../client';

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: string;
  status: string;
  updatedAt: string;
}

export interface SearchParams {
  q: string;
  status?: string;
  folderId?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export const searchService = {
  async search(params: SearchParams): Promise<SearchResult[]> {
    const res = await apiClient.get<SearchResult[]>('/search', { params });
    return res.data;
  },
};
