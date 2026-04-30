// Core Types for Spatial Tours Platform

export interface Walkthrough {
  id: string;
  name: string;
  client?: string;
  address?: string;
  status: 'draft' | 'active' | 'archived';
  description?: string;
  created_by?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  scene_count?: number;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Scene {
  id: string;
  walkthrough_id: string;
  image_path: string;
  image_url: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
  position_x: number;
  position_y: number;
  position_z: number;
  floor: number;
  room_name?: string;
  metadata?: any;
  created_at: string;
  ai_tag_count?: number;
  issue_count?: number;
  // NEW: Nadir patch fields
  nadir_image_path?: string;
  nadir_image_url?: string;
  nadir_scale?: number;
  nadir_rotation?: number;
  nadir_opacity?: number;
}

export interface NavigationEdge {
  id: string;
  from_scene_id: string;
  to_scene_id: string;
  hotspot_yaw?: number;
  hotspot_pitch?: number;
  label?: string;
  created_at: string;
}

export interface AITag {
  id: string;
  scene_id: string;
  object_type: string;
  confidence: number;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tags?: string[];
  ai_model?: string;
  processed_at: string;
}

export interface Issue {
  id: string;
  walkthrough_id: string;
  scene_id: string;
  ai_tag_id?: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description?: string;
  view_angle?: {
    yaw: number;
    pitch: number;
    fov: number;
  };
  coordinates_3d?: {
    x: number;
    y: number;
    z: number;
  };
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Version {
  id: string;
  walkthrough_id: string;
  version_number: number;
  snapshot_data: any;
  change_description?: string;
  created_by?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  walkthrough_id: string;
  scene_id: string;
  user_id: string;
  content: string;
  position?: {
    yaw: number;
    pitch: number;
  };
  created_at: string;
}

export type AssetType = 'HVAC' | 'Elevator' | 'Fire Extinguisher' | 'Lighting' | 'Plumbing' | 'Other';

export interface ComplianceTag {
  regulation: string;
  status: 'pass' | 'fail' | 'pending';
  note?: string;
  checked_at?: string;
}

export interface AssetDocument {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  uploaded_at: string;
  mimetype: string;
}

export interface Asset {
  health_score?: number;
  compliance?: ComplianceTag[];
  id: string;
  name: string;
  type: AssetType;
  brand?: string;
  model?: string;
  serial_number?: string;
  scene_id?: string;
  yaw?: number;
  pitch?: number;
  floor?: number;
  room?: string;
  status: 'active' | 'maintenance' | 'retired';
  walkthrough_id?: string;
  org_id?: string;
  property_id?: string;
  purchase_date?: string;
  warranty_date?: string;
  documents?: AssetDocument[];
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
}
