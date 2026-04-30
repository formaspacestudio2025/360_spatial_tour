import apiClient from './client';

export type HotspotCategory =
  | 'navigation'
  | 'information'
  | 'warning'
  | 'issue'
  | 'media'
  | 'document'
  | 'custom';

export interface Hotspot {
  id: string;
  from_scene_id: string;
  to_scene_id: string;
  yaw: number;
  pitch: number;
  target_yaw?: number;        // Orientation on destination
  target_pitch?: number;      // Orientation on destination
  label?: string;
  icon_type?: string;         // navigation, info, warning, issue, image, video, document, custom
  icon_color?: string;        // Hotspot color
  title?: string;             // Display title
  description?: string;       // Detailed description
  media_type?: string;        // image, video, pdf, document, url, text
  media_url?: string;         // Media URL
  custom_icon_url?: string;   // Custom icon image
  is_locked?: boolean;        // Lock hotspot
  required_role?: string;     // NEW: Minimum role required to access this hotspot
  metadata?: any;             // Extended properties
  category?: HotspotCategory;  // NEW: Hotspot category for filtering

  // NEW: Animation & Style Controls
  animation_type?: string;        // pulse-ring, bounce, glow, ripple, floating, arrow-sweep, breathing, orbit-halo, ping, spotlight, tooltip, progress, warning-flash, checkmark
  animation_speed?: number;       // 0.5 - 3.0 (default 1.0)
  animation_intensity?: number;   // 0.1 - 1.0 (default 0.5)
  icon_size?: number;             // 0.5 - 2.0 (default 1.0)
  opacity?: number;               // 0.1 - 1.0 (default 1.0)
  label_position?: string;        // top, bottom, left, right (default top)
  hover_scale?: number;           // 1.0 - 2.0 (default 1.2)
  visible_distance?: number;      // 0 - 100 (default 0 = always visible)
  always_visible?: boolean;       // default true
  background_color?: string;      // hex color for background circle

  created_at: string;
}

export interface CreateHotspotData {
  to_scene_id: string;
  yaw: number;
  pitch: number;
  target_yaw?: number;
  target_pitch?: number;
  label?: string;
  icon_type?: string;
  icon_color?: string;
  title?: string;
  description?: string;
  media_type?: string;
  media_url?: string;
  custom_icon_url?: string;
  is_locked?: boolean;
  required_role?: string;     // NEW: Minimum role required to access this hotspot
  metadata?: any;
  category?: HotspotCategory;  // NEW: Hotspot category for filtering

  // NEW: Animation & Style Controls
  animation_type?: string;
  animation_speed?: number;
  animation_intensity?: number;
  icon_size?: number;
  opacity?: number;
  label_position?: string;
  hover_scale?: number;
  visible_distance?: number;
  always_visible?: boolean;
  background_color?: string;
}

export const hotspotsApi = {
  getByScene: async (sceneId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Hotspot[] }>(
      `/api/scenes/${sceneId}/hotspots`
    );
    return response.data;
  },

  create: async (sceneId: string, data: CreateHotspotData) => {
    const response = await apiClient.post<{ success: boolean; data: Hotspot }>(
      `/api/scenes/${sceneId}/hotspots`,
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<CreateHotspotData>) => {
    const response = await apiClient.put<{ success: boolean; data: Hotspot }>(
      `/api/hotspots/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/hotspots/${id}`
    );
    return response.data;
  },
};
