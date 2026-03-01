export declare enum UserRole {
    Owner = "owner",
    Admin = "admin",
    Editor = "editor",
    Reviewer = "reviewer",
    Viewer = "viewer"
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    passwordHash?: string;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user.d.ts.map