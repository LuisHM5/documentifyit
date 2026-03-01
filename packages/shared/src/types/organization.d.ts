export declare enum OrgPlan {
    Free = "free",
    Pro = "pro",
    Enterprise = "enterprise"
}
export interface OrganizationSettings {
    allowPublicSharing: boolean;
    maxStorageGb: number;
    maxMembers: number;
    aiEnabled: boolean;
}
export interface Organization {
    id: string;
    name: string;
    plan: OrgPlan;
    settings: OrganizationSettings;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=organization.d.ts.map