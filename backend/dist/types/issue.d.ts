export interface Issue {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
}
export type CreateIssueData = Omit<Issue, 'id'>;
//# sourceMappingURL=issue.d.ts.map