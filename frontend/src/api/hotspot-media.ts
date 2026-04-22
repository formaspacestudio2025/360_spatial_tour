import apiClient from './client';

export interface HotspotMedia {
  id: string;
  hotspot_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  file_path: string;
  file_url?: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  sort_order: number;
  uploaded_by?: string;
  created_at: string;
}

export const hotspotMediaApi = {
  // Get all media for a hotspot
  getByHotspot: async (hotspotId: string): Promise<HotspotMedia[]> => {
    const response = await apiClient.get(`/api/hotspot-media/${hotspotId}`);
    return response.data.data;
  },

  // Upload files to a hotspot
  uploadFiles: async (hotspotId: string, files: File[]): Promise<HotspotMedia[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    // Don't set Content-Type header - let axios set it with boundary
    const response = await apiClient.post(`/api/hotspot-media/${hotspotId}/upload`, formData);
    return response.data.data;
  },

  // Update media metadata
  update: async (id: string, data: { title?: string; description?: string; sort_order?: number }): Promise<HotspotMedia> => {
    const response = await apiClient.put(`/api/hotspot-media/${id}`, data);
    return response.data.data;
  },

  // Delete a media file
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/hotspot-media/${id}`);
  },

  // Bulk delete media files
  bulkDelete: async (ids: string[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post('/api/hotspot-media/bulk-delete', { ids });
    return response.data.data;
  },

  // Reorder media files
  reorder: async (hotspotId: string, mediaIds: string[]): Promise<HotspotMedia[]> => {
    const response = await apiClient.post(`/api/hotspot-media/${hotspotId}/reorder`, { mediaIds });
    return response.data.data;
  },
};
