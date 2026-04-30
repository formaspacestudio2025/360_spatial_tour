import api from './client';

export interface WorkOrderData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'completed' | 'on_hold';
  due_date?: string;
  assigned_to?: string;
}

export const workOrdersApi = {
  create: (assetId: string, data: WorkOrderData) =>
    api.post<{ success: boolean; data: any }>(`/api/assets/${assetId}/work-orders`, data)
      .then(r => r.data.data),

  update: (workOrderId: string, data: Partial<WorkOrderData>) =>
    api.put<{ success: boolean; data: any }>(`/api/assets/work-orders/${workOrderId}`, data)
      .then(r => r.data.data),
};
