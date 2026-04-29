export interface IssueHistory {
    id: string;
    action: string;
    user_id?: string;
    user_name?: string;
    issue_id?: string;
    field?: string;
    old_value?: string;
    new_value?: string;
    timestamp: string;
    created_at?: string;
    details?: string;
}
export interface IssueComment {
    id: string;
    user_id: string;
    user_name: string;
    body: string;
    timestamp: string;
    attachments?: string[];
}
export interface IssueAttachment {
    id: string;
    issue_id: string;
    file_url: string;
    file_type: string;
    created_at: string;
}
export interface Issue {
    id: string;
    walkthrough_id: string;
    scene_id: string;
    yaw: number;
    pitch: number;
    floor?: number;
    room?: string;
    type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved' | 'verified' | 'closed' | 'reopened';
    title: string;
    description?: string;
    assigned_to?: string;
    due_date?: string;
    resolution_proof_url?: string;
    resolution_image_url?: string;
    resolved_at?: string;
    history?: IssueHistory[];
    comments?: IssueComment[];
    attachments?: IssueAttachment[];
    created_at: string;
    updated_at: string;
}
export declare function createIssue(data: {
    walkthrough_id: string;
    scene_id: string;
    yaw: number;
    pitch: number;
    floor?: number;
    room?: string;
    type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description?: string;
    assigned_to?: string;
    due_date?: string;
    org_id?: string;
    property_id?: string;
    attachments?: IssueAttachment[];
}): Promise<Issue>;
export declare function getIssues(): Promise<Issue[]>;
export declare function updateIssue(id: string, data: Partial<Issue>): Promise<Issue | null>;
/**
 * Upload resolution proof image and mark issue as resolved.
 */
export declare function resolveIssue(id: string, resolutionImageUrl: string): Promise<Issue | null>;
export declare function deleteIssue(id: string): Promise<boolean>;
export declare function addComment(issueId: string, comment: {
    user_id: string;
    user_name: string;
    body: string;
    attachments?: string[];
}): Promise<IssueComment | null>;
export declare function getComments(issueId: string): Promise<IssueComment[]>;
export declare function deleteComment(issueId: string, commentId: string): Promise<boolean>;
export declare function addAttachment(issueId: string, attachment: {
    id?: string;
    file_url: string;
    file_type: string;
    created_at: string;
}): Promise<IssueAttachment | null>;
export declare function getAttachments(issueId: string): Promise<IssueAttachment[]>;
export declare function deleteAttachment(issueId: string, attachmentId: string): Promise<boolean>;
export interface SlaEscalationResult {
    issue_id: string;
    title: string;
    days_overdue: number;
    old_priority: string;
    new_priority: string;
    escalated: boolean;
}
/**
 * Check all open/in-progress issues for SLA breaches and auto-escalate
 * Rules:
 * - If overdue by 1+ days: upgrade priority (low->medium->high->critical)
 * - If overdue by 3+ days: change status to 'pending_approval' (escalate to manager)
 * - Add history entry for each escalation
 */
export declare function checkAndEscalateSLA(): Promise<SlaEscalationResult[]>;
/**
 * Get SLA statistics for dashboard
 */
export declare function getSlaStats(): Promise<{
    total_with_sla: number;
    overdue: number;
    critical_overdue: number;
    avg_resolution_days: number;
}>;
//# sourceMappingURL=issue.service.d.ts.map