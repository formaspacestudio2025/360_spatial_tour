export interface InspectionItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'signed_off' | 'rejected';

export interface Inspection {
  id: string;
  walkthrough_id: string;
  scene_id?: string;
  asset_id?: string;
  title: string;
  status: InspectionStatus;
  items: InspectionItem[];
  inspector_id?: string;
  inspector_name?: string;
  started_at?: string;
  completed_at?: string;
  signed_off_at?: string;
  due_date?: string;
  location_data?: Record<string, any>;
  weather_conditions?: string;
  auto_generated?: boolean;
  created_at: string;
  updated_at: string;
}
