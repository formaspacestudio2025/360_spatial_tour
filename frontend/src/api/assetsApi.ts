import api from './client';
import { Asset, AssetType } from '@/types';

export interface CreateAssetData {
  name: string;
  type: AssetType;
  brand?: string;
  model?: string;
  serial_number?: string;
  scene_id?: string;
  yaw?: number;
  pitch?: number;
  floor?: number;
  room?: string;
  status?: 'active' | 'maintenance' | 'retired';
  walkthrough_id?: string;
  org_id?: string;
  property_id?: string;
  purchase_date?: string;
  warranty_date?: string;
}

export interface UpdateAssetData {
  name?: string;
  type?: AssetType;
  brand?: string;
  model?: string;
  serial_number?: string;
  scene_id?: string;
  yaw?: number;
  pitch?: number;
  floor?: number;
  room?: string;
  status?: 'active' | 'maintenance' | 'retired';
  walkthrough_id?: string;
  org_id?: string;
  property_id?: string;
  purchase_date?: string;
  warranty_date?: string;
}

export interface AssetFilters {
  walkthrough_id?: string;
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  health_min?: number;
  q?: string; // search query
}

export const assetsApi = {
  getAll: (filters: AssetFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.walkthrough_id) params.append('walkthrough_id', filters.walkthrough_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.health_min !== undefined) params.append('health_min', filters.health_min.toString());
    if (filters.q) params.append('q', filters.q);
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 10).toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<{ success: boolean; data: Asset[]; total: number; page: number; limit: number }>(`/api/assets${query}`)
      .then(r => ({ assets: r.data.data, total: r.data.total, page: r.data.page, limit: r.data.limit }));
  },

  getById: (id: string) =>
    api.get<{ success: boolean; data: Asset }>(`/api/assets/${id}`)
      .then(r => r.data.data),

  create: (data: CreateAssetData) =>
    api.post<{ success: boolean; data: Asset }>('/api/assets', data)
      .then(r => r.data.data),

  update: (id: string, data: UpdateAssetData) =>
    api.put<{ success: boolean; data: Asset }>(`/api/assets/${id}`, data)
      .then(r => r.data.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/assets/${id}`)
      .then(r => r.data),

  mapToScene: (id: string, data: { scene_id?: string; yaw?: number; pitch?: number; floor?: number; room?: string; }) =>
    api.put<{ success: boolean; data: Asset }>(`/api/assets/${id}/map-to-scene`, data)
      .then(r => r.data.data),

  qr: (id: string, size: number = 200) =>
    api.get(`/api/assets/${id}/qr?size=${size}`, { responseType: 'blob' })
      .then(r => URL.createObjectURL(r.data)),

  // Document functions
  getDocuments: (id: string) =>
    api.get<{ success: boolean; data: any }>(`/api/assets/${id}/documents`)
      .then(r => r.data.data),

  uploadDocument: (id: string, formData: FormData) =>
    api.post<{ success: boolean; data: any }>(`/api/assets/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(r => r.data),

  deleteDocument: (id: string, filename: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/assets/${id}/documents/${filename}`)
      .then(r => r.data),

  getContext: (id: string) =>
    api.get<{ success: boolean; data: { asset: any; issues: any[]; inspections: any[]; workOrders: any[] } }>(`/api/assets/${id}/context`)
      .then(r => r.data.data),

  getRecentInspections: (limit: number = 5) =>
    api.get<{ success: boolean; data: any[] }>(`/api/assets/recent-inspections?limit=${limit}`)
      .then(r => r.data.data),
};
