import api from './client';

export interface InspectionItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface Inspection {
  id: string;
  walkthrough_id: string;
  scene_id?: string;
  asset_id?: string;
  title: string;
  status: 'in_progress' | 'completed' | 'signed_off';
  items: InspectionItem[];
  inspector_id?: string;
  inspector_name?: string;
  completed_at?: string;
  signed_off_at?: string;
  due_date?: string;
  auto_generated?: boolean;
  created_at: string;
  updated_at: string;
}

export const inspectionsApi = {
  getAll: (walkthrough_id?: string) =>
    api.get<{ success: boolean; data: Inspection[] }>('/api/inspections', {
      params: walkthrough_id ? { walkthrough_id } : {},
    }).then(r => r.data.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Inspection }>(`/api/inspections/${id}`)
      .then(r => r.data.data),

  create: (data: { walkthrough_id: string; scene_id?: string; title: string; items: Omit<InspectionItem, 'id' | 'checked'>[] }) =>
    api.post<{ success: boolean; data: Inspection }>('/api/inspections', data)
      .then(r => r.data.data),

  scheduleForAsset: (data: { asset_id: string; walkthrough_id: string; due_date: string; checklist: string[] }) =>
    api.post<{ success: boolean; data: Inspection }>('/api/inspections/schedule-for-asset', data)
      .then(r => r.data.data),

  toggleItem: (id: string, itemId: string) =>
    api.put<{ success: boolean; data: Inspection }>(`/api/inspections/${id}/toggle/${itemId}`)
      .then(r => r.data.data),

  signOff: (id: string) =>
    api.post<{ success: boolean; data: Inspection }>(`/api/inspections/${id}/signoff`)
      .then(r => r.data.data),
};
