import api from './client';
import { Asset } from '@/types';

export interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  frequency_days: number;
  next_due_date: string;
  last_completed_date?: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export const maintenanceApi = {
  getByAsset: (assetId: string) =>
    api.get<{ success: boolean; data: MaintenanceSchedule[] }>(`/api/maintenance?asset_id=${assetId}`)
      .then(r => r.data.data),

  create: (data: { assetId: string; frequencyDays: number; nextDueDate?: string }) =>
    api.post<{ success: boolean; data: MaintenanceSchedule }>(`/api/maintenance`, {
      asset_id: data.assetId,
      frequency_days: data.frequencyDays,
      next_due_date: data.nextDueDate,
    }).then(r => r.data.data),

  update: (id: string, data: Partial<MaintenanceSchedule>) =>
    api.put<{ success: boolean; data: MaintenanceSchedule }>(`/api/maintenance/${id}`, data)
      .then(r => r.data.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/maintenance/${id}`)
      .then(r => r.data),
};
