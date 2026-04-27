export interface IssueAttachment {
  id: string;
  issue_id: string;
  file_url: string;
  file_type: string; // MIME type
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

export interface Issue {
  resolution_image_url?: string;
  resolved_at?: string;
  id: string;
  walkthrough_id: string;
  scene_id: string;
  yaw: number;
  pitch: number;
  floor?: number;
  room?: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved' | 'verified' | 'closed' | 'reopened';
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

export type CreateIssueData = Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'history' | 'comments' | 'attachments' | 'status' | 'priority'> & {
  status?: Issue['status'];
  priority?: Issue['priority'];
};
