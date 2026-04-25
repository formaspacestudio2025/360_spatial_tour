import apiClient from './client';
import { Issue, CreateIssueData } from '@/types/issue';

export const issuesApi = {
  // Get all issues with optional filters
  getAll: async (params?: { scene_id?: string; walkthrough_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.scene_id) query.set('scene_id', params.scene_id);
    if (params?.walkthrough_id) query.set('walkthrough_id', params.walkthrough_id);
    const queryString = query.toString();
    const response = await apiClient.get<{ success: boolean; data: Issue[] }>(
      `/api/issues${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get issue by ID
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Issue }>(`/api/issues/${id}`);
    return response.data;
  },

  // Create issue
  create: async (data: CreateIssueData) => {
    const response = await apiClient.post<{ success: boolean; data: Issue }>('/api/issues', data);
    return response.data;
  },

  // Update issue
  update: async (id: string, data: Partial<CreateIssueData>) => {
    const response = await apiClient.put<{ success: boolean; data: Issue }>(`/api/issues/${id}`, data);
    return response.data;
  },

  // Delete issue
  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/issues/${id}`);
    return response.data;
  },
};
