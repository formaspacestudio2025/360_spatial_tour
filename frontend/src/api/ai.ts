import apiClient from './client';

export interface AIConfig {
  baseUrl: string;
  model: string;
}

export interface AITag {
  id: string;
  scene_id: string;
  object_type: string;
  confidence: number;
  bounding_box?: { x: number; y: number; width: number; height: number };
  tags?: string[];
  ai_model?: string;
  processed_at: string;
}

export interface AIProcessingResult {
  scene_id: string;
  tags: AITag[];
  processing_time: number;
  model_used: string;
}

export interface AIConnectionTest {
  connected: boolean;
  model?: string;
  error?: string;
}

export const aiApi = {
  getConfig: async () => {
    const response = await apiClient.get<{ success: boolean; data: AIConfig }>('/api/ai/config');
    return response.data;
  },

  setConfig: async (data: AIConfig) => {
    const response = await apiClient.post<{ success: boolean; data: any }>('/api/ai/config', data);
    return response.data;
  },

  testConnection: async () => {
    const response = await apiClient.post<{ success: boolean; data: AIConnectionTest }>('/api/ai/test');
    return response.data;
  },

  processScene: async (walkthroughId: string, sceneId: string) => {
    const response = await apiClient.post<{ success: boolean; data: AIProcessingResult }>(
      `/api/walkthroughs/${walkthroughId}/scenes/${sceneId}/ai/process`
    );
    return response.data;
  },

  processAll: async (walkthroughId: string) => {
    const response = await apiClient.post<{ success: boolean; data: { total: number; successful: number; failed: number } }>(
      `/api/walkthroughs/${walkthroughId}/ai/process-all`
    );
    return response.data;
  },

  getTags: async (walkthroughId: string) => {
    const response = await apiClient.get<{ success: boolean; data: AITag[] }>(
      `/api/walkthroughs/${walkthroughId}/ai/tags`
    );
    return response.data;
  },

  getSceneTags: async (sceneId: string) => {
    const response = await apiClient.get<{ success: boolean; data: AITag[] }>(
      `/api/scenes/${sceneId}/ai/tags`
    );
    return response.data;
  },

  updateTag: async (tagId: string, data: Partial<AITag>) => {
    const response = await apiClient.put<{ success: boolean }>(`/api/ai/tags/${tagId}`, data);
    return response.data;
  },

  deleteTag: async (tagId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/api/ai/tags/${tagId}`);
    return response.data;
  },
};
