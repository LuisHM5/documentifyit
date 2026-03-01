"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = void 0;
var AuditAction;
(function (AuditAction) {
    // Auth
    AuditAction["UserLogin"] = "user.login";
    AuditAction["UserLogout"] = "user.logout";
    AuditAction["UserRegistered"] = "user.registered";
    // Documents
    AuditAction["DocumentCreated"] = "document.created";
    AuditAction["DocumentUpdated"] = "document.updated";
    AuditAction["DocumentDeleted"] = "document.deleted";
    AuditAction["DocumentRestored"] = "document.restored";
    AuditAction["DocumentApproved"] = "document.approved";
    AuditAction["DocumentRejected"] = "document.rejected";
    AuditAction["DocumentSubmitted"] = "document.submitted";
    AuditAction["DocumentShared"] = "document.shared";
    // Templates
    AuditAction["TemplateCreated"] = "template.created";
    AuditAction["TemplateUpdated"] = "template.updated";
    AuditAction["TemplateDeleted"] = "template.deleted";
    // API keys
    AuditAction["ApiKeyCreated"] = "api_key.created";
    AuditAction["ApiKeyRevoked"] = "api_key.revoked";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=audit-log.js.map