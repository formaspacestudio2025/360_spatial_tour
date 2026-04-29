export interface DashboardStats {
    total_projects: number;
    total_scenes: number;
    open_issues: number;
    resolved_issues: number;
    total_ai_tags: number;
    total_users: number;
    critical_issues: number;
    overdue_issues: number;
    in_progress_issues: number;
    total_issues: number;
}
export interface ActivityItem {
    id: string;
    type: 'walkthrough_created' | 'scene_uploaded' | 'issue_created' | 'issue_resolved' | 'user_registered';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
}
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}
export interface TrendDataPoint {
    date: string;
    created: number;
    resolved: number;
}
export declare class DashboardService {
    /**
     * Filter issues by date range (based on created_at)
     */
    private filterByDate;
    /**
     * Filter issues by walkthrough_id
     */
    private filterByWalkthrough;
    /**
     * Get dashboard statistics
     */
    getStats(startDate?: string, endDate?: string, walkthroughId?: string): DashboardStats;
    /**
     * Get issues grouped by status for pie/donut chart
     */
    getIssuesByStatus(startDate?: string, endDate?: string, walkthroughId?: string): ChartDataPoint[];
    /**
     * Get issues grouped by type for bar chart
     */
    getIssuesByType(startDate?: string, endDate?: string, walkthroughId?: string): ChartDataPoint[];
    /**
     * Get issues grouped by priority for bar chart
     */
    getIssuesByPriority(startDate?: string, endDate?: string, walkthroughId?: string): ChartDataPoint[];
    /**
     * Get issue creation trend for date range
     */
    getIssueTrend(startDate?: string, endDate?: string, walkthroughId?: string): TrendDataPoint[];
    /**
     * Get recent activity feed
     */
    getRecentActivity(limit?: number): ActivityItem[];
    /**
     * Get team members (all users)
     */
    getTeam(): {
        id: any;
        name: any;
        email: any;
        role: any;
        joined: any;
        online: boolean;
    }[];
}
export declare const dashboardService: DashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map