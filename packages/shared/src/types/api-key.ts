export enum ApiKeyScope {
  DocumentsRead = 'documents:read',
  DocumentsWrite = 'documents:write',
  TemplatesRead = 'templates:read',
  TemplatesWrite = 'templates:write',
  UsersRead = 'users:read',
  Admin = 'admin',
}

export interface ApiKey {
  id: string;
  orgId: string;
  name: string;
  /** SHA-256 hash of the actual key */
  keyHash: string;
  scopes: ApiKeyScope[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
}
