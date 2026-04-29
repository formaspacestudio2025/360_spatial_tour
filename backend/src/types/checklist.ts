export interface ChecklistItemTemplate {
  id: string;
  label: string;
  description?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  asset_type?: string; // optional filter
  items: ChecklistItemTemplate[];
  created_at: string;
  updated_at: string;
}
