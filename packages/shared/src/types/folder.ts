export interface Folder {
  id: string;
  name: string;
  /** null for root-level folders */
  parentId: string | null;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}
