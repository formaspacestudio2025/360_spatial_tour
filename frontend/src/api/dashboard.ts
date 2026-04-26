import apiClient from './client';

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
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  online: boolean;
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

export const dashboardApi = {
  getStats: async (startDate?: string, endDate?: string, walkthroughId?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    if (walkthroughId) query.set('walkthroughId', walkthroughId);
    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      `/api/dashboard/stats${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  getActivity: async (limit: number = 10) => {
    const response = await apiClient.get<{ success: boolean; data: ActivityItem[] }>(`/api/dashboard/activity?limit=${limit}`);
    return response.data;
  },

  getTeam: async () => {
    const response = await apiClient.get<{ success: boolean; data: TeamMember[] }>('/api/dashboard/team');
    return response.data;
  },

  getIssuesByStatus: async (startDate?: string, endDate?: string, walkthroughId?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    if (walkthroughId) query.set('walkthroughId', walkthroughId);
    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: ChartDataPoint[] }>(
      `/api/dashboard/charts/issues-by-status${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  getIssuesByType: async (startDate?: string, endDate?: string, walkthroughId?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    if (walkthroughId) query.set('walkthroughId', walkthroughId);
    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: ChartDataPoint[] }>(
      `/api/dashboard/charts/issues-by-type${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  getIssuesByPriority: async (startDate?: string, endDate?: string, walkthroughId?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    if (walkthroughId) query.set('walkthroughId', walkthroughId);
    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: ChartDataPoint[] }>(
      `/api/dashboard/charts/issues-by-priority${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  getIssueTrend: async (startDate?: string, endDate?: string, walkthroughId?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    if (walkthroughId) query.set('walkthroughId', walkthroughId);
    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: TrendDataPoint[] }>(
      `/api/dashboard/charts/issue-trend${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },
};

