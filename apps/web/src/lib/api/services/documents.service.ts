import { apiClient } from '../client';
import type { Document, DocumentStatus, DocumentVersion } from '@documentifyit/shared';

export interface CreateDocumentRequest {
  title: string;
  content?: Record<string, unknown>;
  folderId?: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: Record<string, unknown>;
  status?: DocumentStatus;
  folderId?: string;
  tags?: string[];
}

export const documentsService = {
  async findAll(): Promise<Document[]> {
    const res = await apiClient.get<Document[]>('/documents');
    return res.data;
  },

  async findById(id: string): Promise<Document> {
    const res = await apiClient.get<Document>(`/documents/${id}`);
    return res.data;
  },

  async create(data: CreateDocumentRequest): Promise<Document> {
    const res = await apiClient.post<Document>('/documents', data);
    return res.data;
  },

  async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const res = await apiClient.put<Document>(`/documents/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },

  async getVersions(id: string): Promise<DocumentVersion[]> {
    const res = await apiClient.get<DocumentVersion[]>(`/documents/${id}/versions`);
    return res.data;
  },

  async restoreVersion(id: string, versionNumber: number): Promise<Document> {
    const res = await apiClient.post<Document>(`/documents/${id}/versions/${versionNumber}/restore`);
    return res.data;
  },

  async transition(
    id: string,
    status: DocumentStatus,
    comment?: string,
  ): Promise<Document> {
    const res = await apiClient.post<Document>(`/documents/${id}/transition`, { status, comment });
    return res.data;
  },

  async createShareLink(documentId: string, expiresAt?: string): Promise<{ token: string; id: string }> {
    const res = await apiClient.post<{ token: string; id: string }>('/share', {
      documentId,
      expiresAt,
    });
    return res.data;
  },
};
