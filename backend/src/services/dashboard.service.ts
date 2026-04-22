import db from '../config/database';

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

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  getStats(): DashboardStats {
    const walkthroughs = db.prepare('SELECT * FROM walkthroughs').all();
    const scenes = db.prepare('SELECT * FROM scenes').all();
    const issues = db.prepare('SELECT * FROM issues').all();
    const aiTags = db.prepare('SELECT * FROM ai_tags').all();
    const users = db.prepare('SELECT * FROM users').all();

    const openIssues = issues.filter((i: any) => i.status === 'open');
    const resolvedIssues = issues.filter((i: any) => i.status === 'resolved');

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
  getRecentActivity(limit: number = 10): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Get recent walkthroughs
    const walkthroughs = db.prepare('SELECT * FROM walkthroughs ORDER BY created_at DESC').all() as any[];
    walkthroughs.slice(0, limit).forEach((w: any) => {
      activities.push({
        id: `w-${w.id}`,
        type: 'walkthrough_created',
        title: 'New Project Created',
        description: `"${w.name}" was created`,
        timestamp: w.created_at,
      });
    });

    // Get recent scenes
    const scenes = db.prepare('SELECT * FROM scenes ORDER BY created_at DESC').all() as any[];
    scenes.slice(0, limit).forEach((s: any) => {
      activities.push({
        id: `s-${s.id}`,
        type: 'scene_uploaded',
        title: 'Scene Uploaded',
        description: `"${s.room_name || 'Untitled'}" was added`,
        timestamp: s.created_at,
      });
    });

    // Get recent issues
    const issues = db.prepare('SELECT * FROM issues ORDER BY created_at DESC').all() as any[];
    issues.slice(0, limit).forEach((i: any) => {
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
    const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all() as any[];
    return users.map((u: any) => ({
      id: u.id,
      name: u.username,
      email: u.email,
      role: u.role,
      joined: u.created_at,
      online: false, // Placeholder for real-time presence
    }));
  }
}

export const dashboardService = new DashboardService();
