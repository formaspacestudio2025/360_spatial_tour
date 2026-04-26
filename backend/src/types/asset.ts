export interface Asset {
  id: string;
  name: string;
  type: string; // 'HVAC' | 'Elevator' | 'Fire Extinguisher' | 'Lighting' | 'Plumbing' | 'Other'
  brand?: string;
  model?: string;
  serial_number?: string;
  scene_id?: string;       // which 360 scene it's pinned to
  yaw?: number;            // spatial pinning
  pitch?: number;
  floor?: number;
  room?: string;
  status: 'active' | 'maintenance' | 'retired';
  walkthrough_id?: string;  // which property/walkthrough it belongs to
  created_at: string;
  updated_at: string;
}
