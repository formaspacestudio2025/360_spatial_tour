"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const database_1 = __importDefault(require("../config/database"));
class DashboardService {
    /**
     * Filter issues by date range (based on created_at)
     */
    filterByDate(issues, startDate, endDate) {
        return issues.filter((i) => {
            if (startDate && i.created_at < startDate)
                return false;
            if (endDate && i.created_at > endDate)
                return false;
            return true;
        });
    }
    /**
     * Filter issues by walkthrough_id
     */
    filterByWalkthrough(issues, walkthroughId) {
        if (!walkthroughId)
            return issues;
        return issues.filter((i) => i.walkthrough_id === walkthroughId);
    }
    /**
     * Get dashboard statistics
     */
    getStats(startDate, endDate, walkthroughId) {
        const walkthroughs = database_1.default.prepare('SELECT * FROM walkthroughs').all();
        const scenes = database_1.default.prepare('SELECT * FROM scenes').all();
        const allIssues = database_1.default.prepare('SELECT * FROM issues').all();
        const aiTags = database_1.default.prepare('SELECT * FROM ai_tags').all();
        const users = database_1.default.prepare('SELECT * FROM users').all();
        let issues = this.filterByDate(allIssues, startDate, endDate);
        issues = this.filterByWalkthrough(issues, walkthroughId);
        const now = new Date();
        const openIssues = issues.filter((i) => i.status === 'open');
        const resolvedIssues = issues.filter((i) => i.status === 'resolved' || i.status === 'verified' || i.status === 'closed');
        const criticalIssues = issues.filter((i) => i.severity === 'critical' || i.priority === 'critical');
        const inProgressIssues = issues.filter((i) => i.status === 'in_progress' || i.status === 'assigned');
        const overdueIssues = issues.filter((i) => {
            if (!i.due_date)
                return false;
            return new Date(i.due_date) < now && i.status !== 'resolved' && i.status !== 'verified' && i.status !== 'closed';
        });
        // Filter scenes by walkthrough
        const filteredScenes = walkthroughId
            ? scenes.filter((s) => s.walkthrough_id === walkthroughId)
            : scenes;
        const isFiltered = startDate || endDate || walkthroughId;
        const matchedWalkthrough = walkthroughs.find((w) => w.id === walkthroughId);
        return {
            total_projects: isFiltered ? (walkthroughId ? 1 : 0) : walkthroughs.length,
            total_scenes: filteredScenes.length,
            open_issues: openIssues.length,
            resolved_issues: resolvedIssues.length,
            total_ai_tags: isFiltered ? 0 : aiTags.length,
            total_users: isFiltered ? 0 : users.length,
            critical_issues: criticalIssues.length,
            overdue_issues: overdueIssues.length,
            in_progress_issues: inProgressIssues.length,
            total_issues: issues.length,
        };
    }
    /**
     * Get issues grouped by status for pie/donut chart
     */
    getIssuesByStatus(startDate, endDate, walkthroughId) {
        let issues = database_1.default.prepare('SELECT * FROM issues').all();
        issues = this.filterByDate(issues, startDate, endDate);
        issues = this.filterByWalkthrough(issues, walkthroughId);
        const statusColors = {
            open: '#ef4444',
            assigned: '#3b82f6',
            in_progress: '#f59e0b',
            pending_approval: '#8b5cf6',
            resolved: '#10b981',
            verified: '#059669',
            closed: '#6b7280',
            reopened: '#f97316',
        };
        const counts = {};
        issues.forEach((i) => {
            counts[i.status] = (counts[i.status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
            value,
            color: statusColors[name] || '#6b7280',
        }));
    }
    /**
     * Get issues grouped by type for bar chart
     */
    getIssuesByType(startDate, endDate, walkthroughId) {
        let issues = database_1.default.prepare('SELECT * FROM issues').all();
        issues = this.filterByDate(issues, startDate, endDate);
        issues = this.filterByWalkthrough(issues, walkthroughId);
        const typeColors = {
            damage: '#ef4444',
            safety: '#f97316',
            maintenance: '#3b82f6',
            compliance: '#f59e0b',
            custom: '#8b5cf6',
        };
        const counts = {};
        issues.forEach((i) => {
            counts[i.type] = (counts[i.type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name: name.replace(/\b\w/g, c => c.toUpperCase()),
            value,
            color: typeColors[name] || '#6b7280',
        }));
    }
    /**
     * Get issues grouped by priority for bar chart
     */
    getIssuesByPriority(startDate, endDate, walkthroughId) {
        let issues = database_1.default.prepare('SELECT * FROM issues').all();
        issues = this.filterByDate(issues, startDate, endDate);
        issues = this.filterByWalkthrough(issues, walkthroughId);
        const priorityColors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#f97316',
            critical: '#ef4444',
        };
        const counts = { low: 0, medium: 0, high: 0, critical: 0 };
        issues.forEach((i) => {
            const p = i.priority || i.severity || 'medium';
            counts[p] = (counts[p] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name: name.replace(/\b\w/g, c => c.toUpperCase()),
            value,
            color: priorityColors[name] || '#6b7280',
        }));
    }
    /**
     * Get issue creation trend for date range
     */
    getIssueTrend(startDate, endDate, walkthroughId) {
        let issues = database_1.default.prepare('SELECT * FROM issues').all();
        issues = this.filterByDate(issues, startDate, endDate);
        issues = this.filterByWalkthrough(issues, walkthroughId);
        const result = [];
        const now = new Date();
        // Determine date range
        let start = startDate ? new Date(startDate) : new Date(now);
        if (!startDate)
            start.setDate(start.getDate() - 30); // default 30 days
        const end = endDate ? new Date(endDate) : now;
        const current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().slice(0, 10);
            const created = issues.filter((issue) => issue.created_at && issue.created_at.slice(0, 10) === dateStr).length;
            const resolved = issues.filter((issue) => (issue.status === 'resolved' || issue.status === 'verified') &&
                issue.updated_at && issue.updated_at.slice(0, 10) === dateStr).length;
            result.push({
                date: current.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                created,
                resolved,
            });
            current.setDate(current.getDate() + 1);
        }
        return result;
    }
    /**
     * Get recent activity feed
     */
    getRecentActivity(limit = 10) {
        const activities = [];
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
            online: false,
        }));
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map