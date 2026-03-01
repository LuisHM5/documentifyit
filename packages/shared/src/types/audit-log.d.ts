export declare enum AuditAction {
    UserLogin = "user.login",
    UserLogout = "user.logout",
    UserRegistered = "user.registered",
    DocumentCreated = "document.created",
    DocumentUpdated = "document.updated",
    DocumentDeleted = "document.deleted",
    DocumentRestored = "document.restored",
    DocumentApproved = "document.approved",
    DocumentRejected = "document.rejected",
    DocumentSubmitted = "document.submitted",
    DocumentShared = "document.shared",
    TemplateCreated = "template.created",
    TemplateUpdated = "template.updated",
    TemplateDeleted = "template.deleted",
    ApiKeyCreated = "api_key.created",
    ApiKeyRevoked = "api_key.revoked"
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
//# sourceMappingURL=audit-log.d.ts.map