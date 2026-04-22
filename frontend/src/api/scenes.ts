import apiClient from './client';
import { Scene, ApiResponse } from '@/types';

export const scenesApi = {
  // Get all scenes for a walkthrough
  getByWalkthrough: async (walkthroughId: string) => {
    const response = await apiClient.get<ApiResponse<Scene[]>>(
      `/api/walkthroughs/${walkthroughId}/scenes`
    );
    return response.data;
  },

  // Get scene by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Scene>>(`/api/scenes/${id}`);
    return response.data;
  },

  // Upload scene(s)
  upload: async (walkthroughId: string, formData: FormData) => {
    const response = await apiClient.post<ApiResponse<Scene[]>>(
      `/api/walkthroughs/${walkthroughId}/scenes`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update scene
  update: async (id: string, data: Partial<Scene>) => {
    const response = await apiClient.put<ApiResponse<Scene>>(`/api/scenes/${id}`, data);
    return response.data;
  },

  // Delete scene
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/scenes/${id}`);
    return response.data;
  },
};
