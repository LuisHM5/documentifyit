export enum AuditAction {
  // Auth
  UserLogin = 'user.login',
  UserLogout = 'user.logout',
  UserRegistered = 'user.registered',
  // Documents
  DocumentCreated = 'document.created',
  DocumentUpdated = 'document.updated',
  DocumentDeleted = 'document.deleted',
  DocumentRestored = 'document.restored',
  DocumentApproved = 'document.approved',
  DocumentRejected = 'document.rejected',
  DocumentSubmitted = 'document.submitted',
  DocumentShared = 'document.shared',
  // Templates
  TemplateCreated = 'template.created',
  TemplateUpdated = 'template.updated',
  TemplateDeleted = 'template.deleted',
  // API keys
  ApiKeyCreated = 'api_key.created',
  ApiKeyRevoked = 'api_key.revoked',
}

export interface AuditLog {
  id: string;
  action: AuditAction | string;
  actorId: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
  orgId: string;
  ipAddress?: string;
  createdAt: Date;
}
