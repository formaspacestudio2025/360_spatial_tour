export interface Issue {
  id: string;
  walkthrough_id: string;
  scene_id: string;
  yaw: number;
  pitch: number;
  floor?: number;
  room?: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;

  // Extended fields (Phase 2+)
  priority?: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  assigned_to?: string;
  due_date?: string;
  cost_estimate?: number;
  vendor_details?: string;
  attachments?: IssueAttachment[];
  voice_note_url?: string;
  ai_summary?: string;
}

export interface IssueAttachment {
  id: string;
  issue_id: string;
  file_url: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  created_at: string;
}

export interface CreateIssueData {
  walkthrough_id: string;
  scene_id: string;
  yaw: number;
  pitch: number;
  floor?: number;
  room?: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;

  // Extended
  priority?: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  assigned_to?: string;
  due_date?: string;
  cost_estimate?: number;
  vendor_details?: string;
}
