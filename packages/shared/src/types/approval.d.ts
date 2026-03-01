import { UserRole } from './user';
export declare enum ApprovalStepStatus {
    Pending = "pending",
    InProgress = "in_progress",
    Approved = "approved",
    Rejected = "rejected",
    Skipped = "skipped"
}
export interface ApprovalStep {
    id: string;
    flowId: string;
    assigneeRole: UserRole;
    order: number;
    status: ApprovalStepStatus;
    comment?: string;
    actedAt?: Date;
    actedById?: string;
}
export interface ApprovalFlow {
    id: string;
    name: string;
    steps: ApprovalStep[];
    documentTypeId?: string;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=approval.d.ts.map