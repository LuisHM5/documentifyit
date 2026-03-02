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
  /** JSONB — BlockNote stores content as a flat Block[] array */
  content: unknown;
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
