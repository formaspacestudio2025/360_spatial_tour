export interface IssueAttachment {
    id: string;
    issue_id: string;
    file_url: string;
    file_type: string;
    created_at: string;
}
export interface Issue {
    resolution_image_url?: string;
    resolved_at?: string;
    id: string;
    walkthrough_id: string;
    scene_id: string;
    yaw: number;
    pitch: number;
    floor?: number;
    room?: string;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    org_id?: string;
    property_id?: string;
    attachments?: IssueAttachment[];
}
export type CreateIssueData = Omit<Issue, 'id'>;
//# sourceMappingURL=issue.d.ts.map