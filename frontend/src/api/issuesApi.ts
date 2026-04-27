import apiClient from './client';
import { Issue, CreateIssueData, IssueComment, IssueAttachment } from '@/types/issue';

export const issuesApi = {
  // Get all issues with optional filters
  getAll: async (params?: { scene_id?: string; walkthrough_id?: string; status?: string; priority?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.scene_id) query.set('scene_id', params.scene_id);
    if (params?.walkthrough_id) query.set('walkthrough_id', params.walkthrough_id);
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.type) query.set('type', params.type);
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

  // CSV Export (triggers download)
  exportCsv: (params?: { walkthrough_id?: string; status?: string; priority?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.walkthrough_id) query.set('walkthrough_id', params.walkthrough_id);
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.type) query.set('type', params.type);
    const queryString = query.toString();
    window.open(`/api/issues/export/csv${queryString ? `?${queryString}` : ''}`, '_blank');
  },

  // ===== COMMENTS =====

  // Get comments for an issue
  getComments: async (issueId: string) => {
    const response = await apiClient.get<{ success: boolean; data: IssueComment[] }>(`/api/issues/${issueId}/comments`);
    return response.data;
  },

  // Add comment
  addComment: async (issueId: string, data: { user_id: string; user_name: string; body: string }) => {
    const response = await apiClient.post<{ success: boolean; data: IssueComment }>(`/api/issues/${issueId}/comments`, data);
    return response.data;
  },

  // Delete comment
  deleteComment: async (issueId: string, commentId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/issues/${issueId}/comments/${commentId}`);
    return response.data;
  },

  // ===== ATTACHMENTS =====

  // Get all attachments for an issue
  getAttachments: async (issueId: string) => {
    const response = await apiClient.get<{ success: boolean; data: IssueAttachment[] }>(`/api/issues/${issueId}/attachments`);
    return response.data;
  },

  // Upload attachment to an issue
  uploadAttachment: async (issueId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: boolean; data: IssueAttachment }>(
      `/api/issues/${issueId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (issueId: string, attachmentId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/issues/${issueId}/attachments/${attachmentId}`
    );
    return response.data;
  },

  // SLA escalation check
  checkSla: async () => {
    const response = await apiClient.post<{ success: boolean; data: any[] }>('/api/issues/sla/check');
    return response.data;
  },

  // SLA stats
  getSlaStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: { total_with_sla: number; overdue: number; critical_overdue: number; avg_resolution_days: number } }>('/api/issues/sla/stats');
    return response.data;
  },

  // Upload resolution proof image
  uploadResolution: async (issueId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<{ success: boolean; data: Issue }>(
      `/api/issues/${issueId}/resolution`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },
};
