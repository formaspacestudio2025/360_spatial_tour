export interface Issue {
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
}
export type CreateIssueData = Omit<Issue, 'id'>;
