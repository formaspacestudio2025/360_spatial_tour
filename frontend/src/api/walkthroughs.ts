import apiClient from './client';
import { Walkthrough, ApiResponse } from '@/types';

export const walkthroughApi = {
  // Get all walkthroughs with optional filters
  getAll: async (params?: { search?: string; status?: string; client?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.client) query.set('client', params.client);
    const queryString = query.toString();
    const response = await apiClient.get<ApiResponse<Walkthrough[]>>(
      `/api/walkthroughs${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get unique clients list
  getClients: async () => {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/walkthroughs/clients');
    return response.data;
  },

  // Get walkthrough by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Walkthrough>>(`/api/walkthroughs/${id}`);
    return response.data;
  },

  // Create walkthrough
  create: async (data: { name: string; client?: string; address?: string; status?: string; description?: string; created_by?: string; latitude?: number; longitude?: number }) => {
    const response = await apiClient.post<ApiResponse<Walkthrough>>('/api/walkthroughs', data);
    return response.data;
  },

  // Update walkthrough
  update: async (id: string, data: Partial<{ name: string; client?: string; address?: string; status?: string; description?: string; latitude?: number; longitude?: number }>) => {
    const response = await apiClient.put<ApiResponse<Walkthrough>>(`/api/walkthroughs/${id}`, data);
    return response.data;
  },

  // Delete walkthrough
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/walkthroughs/${id}`);
    return response.data;
  },
};
