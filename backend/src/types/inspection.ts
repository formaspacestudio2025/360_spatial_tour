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
