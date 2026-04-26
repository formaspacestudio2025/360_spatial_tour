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
}

export const assetsApi = {
  getAll: (walkthrough_id?: string) => {
    const query = walkthrough_id ? `?walkthrough_id=${walkthrough_id}` : '';
    return api.get<{ success: boolean; data: Asset[] }>(`/api/assets${query}`)
      .then(r => r.data.data);
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
};
