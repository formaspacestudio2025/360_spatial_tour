export interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  frequency_days: number; // e.g., 90 for quarterly
  next_due_date: string; // ISO date
  last_completed_date?: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}
