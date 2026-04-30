import api from './client';

export interface DashboardStats {
  totalWalkthroughs: number;
  totalScenes: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  totalAssets?: number;
  assetsByHealth?: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  warrantyExpiringSoon?: number;
  overdueInspections?: number;
  assets?: Array<{
    id: string;
    name: string;
    health_score?: number;
    status: string;
  }>;
}

export interface ActivityItem {
  id: string;
  type: 'walkthrough_created' | 'issue_reported' | 'asset_added' | 'inspection_completed';
  title: string;
  description?: string;
  timestamp: string;
  user_name?: string;
}

export const dashboardApi = {
  getStats: (startDate?: string, endDate?: string, propertyId?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (propertyId) params.append('propertyId', propertyId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<{ success: boolean; data: DashboardStats }>(`/api/dashboard/stats${query}`)
      .then(r => r.data.data);
  },

  getActivity: (limit: number = 10) =>
    api.get<{ success: boolean; data: ActivityItem[] }>(`/api/dashboard/activity?limit=${limit}`)
      .then(r => r.data.data),

  getAssetStats: () =>
    api.get<{ success: boolean; data: any }>('/api/dashboard/asset-stats')
      .then(r => r.data.data),
};
