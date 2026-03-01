export declare enum PermissionLevel {
    Owner = "owner",
    Admin = "admin",
    Editor = "editor",
    Reviewer = "reviewer",
    Viewer = "viewer"
}
export declare enum PermissionResourceType {
    Document = "document",
    Folder = "folder"
}
export interface Permission {
    id: string;
    resourceId: string;
    resourceType: PermissionResourceType;
    /** Either userId or roleId must be set */
    userId?: string;
    roleId?: string;
    level: PermissionLevel;
    orgId: string;
    createdAt: Date;
}
//# sourceMappingURL=permission.d.ts.map