export interface IssueAttachment {
  id: string;
  issue_id: string;
  file_url: string;
  file_type: string; // mime type
  created_at: string;
}

export interface Issue {
  id: string;
  walkthrough_id: string;
  scene_id: string;
  yaw: number; // Panorama yaw coordinate (radians)
  pitch: number; // Panorama pitch coordinate (radians)
  floor?: number; // Optional floor number
  room?: string; // Optional room name
  asset_id?: string; // optional link to an asset
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved' | 'verified' | 'closed' | 'reopened' | 'scheduled' | 'completed' | 'signed_off';
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  resolution_proof_url?: string;
  history?: IssueHistory[];
  comments?: IssueComment[];
  attachments?: IssueAttachment[];
  created_at: string;
  updated_at: string;
}

export interface IssueHistory {
  id: string;
  issue_id: string;
  action: string;
  field?: string;
  old_value?: any;
  new_value?: any;
  user_id: string;
  user_name?: string;
  timestamp?: string;
  details?: string;
  created_at: string;
}

export interface IssueComment {
  id: string;
  user_id: string;
  user_name: string;
  body: string;
  timestamp: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export type CreateIssueData = Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'history' | 'comments' | 'attachments'>;
