import api from './client';
import { Org } from '@/types';

export const orgsApi = {
  getAll: () => api.get<{ success: boolean; data: Org[] }>('/api/orgs').then(r => r.data.data),
  getById: (id: string) => api.get<{ success: boolean; data: Org }>(`/api/orgs/${id}`).then(r => r.data.data),
  create: (data: { name: string }) => api.post<{ success: boolean; data: Org }>('/api/orgs', data).then(r => r.data.data),
  update: (id: string, data: Partial<Org>) => api.put<{ success: boolean; data: Org }>(`/api/orgs/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/api/orgs/${id}`).then(r => r.data),
};
