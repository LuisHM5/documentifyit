export interface DocumentVersion {
  id: string;
  documentId: string;
  /** JSONB snapshot of content at this version — BlockNote Block[] array */
  content: unknown;
  versionNumber: number;
  authorId: string;
  createdAt: Date;
}
