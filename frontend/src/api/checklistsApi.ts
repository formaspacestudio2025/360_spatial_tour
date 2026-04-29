import api from './client';

export interface ChecklistItemTemplate {
  id: string;
  label: string;
  description?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  asset_type?: string;
  items: ChecklistItemTemplate[];
  created_at: string;
  updated_at: string;
}

export const checklistsApi = {
  getTemplates: (asset_type?: string) =>
    api.get<{ success: boolean; data: ChecklistTemplate[] }>('/api/checklists', {
      params: asset_type ? { asset_type } : {},
    }).then(r => r.data.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: ChecklistTemplate }>(`/api/checklists/${id}`)
      .then(r => r.data.data),

  create: (data: { name: string; description?: string; asset_type?: string; items: { label: string; description?: string }[] }) =>
    api.post<{ success: boolean; data: ChecklistTemplate }>('/api/checklists', data)
      .then(r => r.data.data),

  update: (id: string, data: Partial<{ name: string; description?: string; asset_type?: string; items: { label: string; description?: string }[] }>) =>
    api.put<{ success: boolean; data: ChecklistTemplate }>(`/api/checklists/${id}`, data)
      .then(r => r.data.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/checklists/${id}`)
      .then(r => r.data),

  assignToAsset: (templateId: string, data: { asset_id: string; walkthrough_id: string; due_date?: string }) =>
    api.post<{ success: boolean; data: any }>(`/api/checklists/${templateId}/assign-to-asset`, data)
      .then(r => r.data.data),
};
