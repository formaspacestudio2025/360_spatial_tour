export type AssetEventType =
  | 'created'
  | 'inspected'
  | 'maintained'
  | 'issue_opened'
  | 'issue_resolved'
  | 'state_changed'
  | 'document_added'
  | 'health_changed'
  | 'location_changed'
  | 'warranty_claimed';

export interface AssetEvent {
  id: string;
  asset_id: string;
  event_type: AssetEventType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  user_id?: string;
  user_name?: string;
  created_at: string;
}

export interface AssetEventCreate {
  asset_id: string;
  event_type: AssetEventType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  user_id?: string;
  user_name?: string;
}

export interface AssetTimelineParams {
  limit?: number;
  offset?: number;
  event_type?: AssetEventType;
  start_date?: string;
  end_date?: string;
}

export interface DigitalTwinSummary {
  total_inspections: number;
  total_maintenance: number;
  total_issues: number;
  resolved_issues: number;
  uptime_percentage: number;
  mtbf_days: number;
  total_cost: number;
  last_inspection?: string;
  last_maintenance?: string;
  health_trend: 'improving' | 'stable' | 'declining';
}
