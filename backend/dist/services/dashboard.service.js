"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const database_1 = __importDefault(require("../config/database"));
class DashboardService {
    /**
     * Get dashboard statistics
     */
    getStats() {
        const walkthroughs = database_1.default.prepare('SELECT * FROM walkthroughs').all();
        const scenes = database_1.default.prepare('SELECT * FROM scenes').all();
        const issues = database_1.default.prepare('SELECT * FROM issues').all();
        const aiTags = database_1.default.prepare('SELECT * FROM ai_tags').all();
        const users = database_1.default.prepare('SELECT * FROM users').all();
        const openIssues = issues.filter((i) => i.status === 'open');
        const resolvedIssues = issues.filter((i) => i.status === 'resolved');
        return {
            total_projects: walkthroughs.length,
            total_scenes: scenes.length,
            open_issues: openIssues.length,
            resolved_issues: resolvedIssues.length,
            total_ai_tags: aiTags.length,
            total_users: users.length,
        };
    }
    /**
     * Get recent activity feed
     */
    getRecentActivity(limit = 10) {
        const activities = [];
        // Get recent walkthroughs
        const walkthroughs = database_1.default.prepare('SELECT * FROM walkthroughs ORDER BY created_at DESC').all();
        walkthroughs.slice(0, limit).forEach((w) => {
            activities.push({
                id: `w-${w.id}`,
                type: 'walkthrough_created',
                title: 'New Project Created',
                description: `"${w.name}" was created`,
                timestamp: w.created_at,
            });
        });
        // Get recent scenes
        const scenes = database_1.default.prepare('SELECT * FROM scenes ORDER BY created_at DESC').all();
        scenes.slice(0, limit).forEach((s) => {
            activities.push({
                id: `s-${s.id}`,
                type: 'scene_uploaded',
                title: 'Scene Uploaded',
                description: `"${s.room_name || 'Untitled'}" was added`,
                timestamp: s.created_at,
            });
        });
        // Get recent issues
        const issues = database_1.default.prepare('SELECT * FROM issues ORDER BY created_at DESC').all();
        issues.slice(0, limit).forEach((i) => {
            activities.push({
                id: `i-${i.id}`,
                type: i.status === 'resolved' ? 'issue_resolved' : 'issue_created',
                title: i.status === 'resolved' ? 'Issue Resolved' : 'New Issue',
                description: `"${i.title}" - ${i.status}`,
                timestamp: i.created_at,
            });
        });
        // Sort by timestamp descending and limit
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
    /**
     * Get team members (all users)
     */
    getTeam() {
        const users = database_1.default.prepare('SELECT id, username, email, role, created_at FROM users').all();
        return users.map((u) => ({
            id: u.id,
            name: u.username,
            email: u.email,
            role: u.role,
            joined: u.created_at,
            online: false, // Placeholder for real-time presence
        }));
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map