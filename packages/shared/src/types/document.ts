export enum DocumentStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  InReview = 'in_review',
  Approved = 'approved',
  Rejected = 'rejected',
  RevisionRequested = 'revision_requested',
  Archived = 'archived',
}

export interface Document {
  id: string;
  title: string;
  /** JSONB — TipTap/BlockNote JSON format */
  content: Record<string, unknown>;
  status: DocumentStatus;
  ownerId: string;
  orgId: string;
  folderId: string | null;
  version: number;
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
