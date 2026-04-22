import apiClient from './client';

export interface HotspotLink {
  id: string;
  hotspot_id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  favicon_url?: string;
  sort_order: number;
  created_at: string;
}

export const hotspotLinksApi = {
  // Get all links for a hotspot
  getByHotspot: async (hotspotId: string): Promise<HotspotLink[]> => {
    const response = await apiClient.get(`/api/hotspot-links/${hotspotId}`);
    return response.data.data;
  },

  // Create a new link
  create: async (hotspotId: string, data: { title: string; url: string; description?: string; category?: string }): Promise<HotspotLink> => {
    const response = await apiClient.post(`/api/hotspot-links/${hotspotId}`, data);
    return response.data.data;
  },

  // Update a link
  update: async (id: string, data: Partial<HotspotLink>): Promise<HotspotLink> => {
    const response = await apiClient.put(`/api/hotspot-links/${id}`, data);
    return response.data.data;
  },

  // Delete a link
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/hotspot-links/${id}`);
  },

  // Bulk delete links
  bulkDelete: async (ids: string[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post('/api/hotspot-links/bulk-delete', { ids });
    return response.data.data;
  },

  // Reorder links
  reorder: async (hotspotId: string, linkIds: string[]): Promise<HotspotLink[]> => {
    const response = await apiClient.post(`/api/hotspot-links/${hotspotId}/reorder`, { linkIds });
    return response.data.data;
  },
};
