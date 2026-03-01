export interface DocumentVersion {
  id: string;
  documentId: string;
  /** JSONB snapshot of content at this version */
  content: Record<string, unknown>;
  versionNumber: number;
  authorId: string;
  createdAt: Date;
}
