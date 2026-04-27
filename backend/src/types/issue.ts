export interface IssueAttachment {
  id: string;
  issue_id: string;
  file_url: string;
  file_type: string; // mime type
  created_at: string;
}

export interface Issue {
  resolution_image_url?: string;
  resolved_at?: string;
  id: string;
  walkthrough_id: string;
  scene_id: string;
  yaw: number; // Panorama yaw coordinate (radians)
  pitch: number; // Panorama pitch coordinate (radians)
  floor?: number; // Optional floor number
  room?: string; // Optional room name
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  org_id?: string;         // organization that owns this issue
  property_id?: string;     // specific property (if different from walkthrough)
  attachments?: IssueAttachment[];
}
export type CreateIssueData = Omit<Issue, 'id'>;
