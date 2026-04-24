export interface DashboardStats {
    total_projects: number;
    total_scenes: number;
    open_issues: number;
    resolved_issues: number;
    total_ai_tags: number;
    total_users: number;
}
export interface ActivityItem {
    id: string;
    type: 'walkthrough_created' | 'scene_uploaded' | 'issue_created' | 'issue_resolved' | 'user_registered';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
}
export declare class DashboardService {
    /**
     * Get dashboard statistics
     */
    getStats(): DashboardStats;
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