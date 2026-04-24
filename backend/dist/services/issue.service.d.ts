interface Issue {
    id: string;
    walkthrough_id: string;
    scene_id: string;
    type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
}
export declare function createIssue(data: {
    walkthrough_id: string;
    scene_id: string;
    type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description?: string;
}): Promise<Issue>;
export declare function getIssues(): Promise<Issue[]>;
export {};
//# sourceMappingURL=issue.service.d.ts.map