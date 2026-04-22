import apiClient from './client';

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

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/api/dashboard/stats');
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
};
