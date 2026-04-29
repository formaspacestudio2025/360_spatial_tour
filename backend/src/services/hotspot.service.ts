import db from '../config/database';
import { generateId } from '../utils/helpers';

export interface Hotspot {
  id: string;
  from_scene_id: string;
  to_scene_id: string;
  yaw: number;
  pitch: number;
  target_yaw?: number;        // Orientation on destination
  target_pitch?: number;      // Orientation on destination
  label?: string;
  icon_type?: string;         // navigation, info, warning, etc.
  icon_color?: string;        // Hotspot color
  title?: string;             // Display title
  description?: string;       // Detailed description
  media_type?: string;        // image, video, pdf, etc.
  media_url?: string;         // Media URL
  custom_icon_url?: string;   // Custom icon
  is_locked?: boolean;        // Lock hotspot
  required_role?: string;     // NEW: Minimum role required to access this hotspot
  metadata?: any;             // Extended properties
  // NEW: Animation & Style fields
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
  created_at: string;
}

export interface CreateHotspotData {
  from_scene_id: string;
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
  // NEW: Animation & Style fields
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

export class HotspotService {
  /**
   * Create a new hotspot
   */
  create(data: CreateHotspotData): Hotspot {
    const id = generateId();

    const stmt = db.prepare(`
      INSERT INTO navigation_edges (
        id, from_scene_id, to_scene_id, 
        hotspot_yaw, hotspot_pitch,
        target_yaw, target_pitch,
        label, icon_type, icon_color,
        title, description,
        media_type, media_url, custom_icon_url,
        is_locked, metadata,
        animation_type, animation_speed, animation_intensity,
        icon_size, opacity, label_position,
        hover_scale, visible_distance, always_visible,
        background_color
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.from_scene_id,
      data.to_scene_id,
      data.yaw,
      data.pitch,
      data.target_yaw || null,
      data.target_pitch || null,
      data.label || null,
      data.icon_type || 'navigation',
      data.icon_color || '#10b981',
      data.title || null,
      data.description || null,
      data.media_type || null,
      data.media_url || null,
      data.custom_icon_url || null,
      data.is_locked ? 1 : 0,
      data.required_role || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.animation_type || 'pulse-ring',
      data.animation_speed || 1.0,
      data.animation_intensity || 0.5,
      data.icon_size || 1.0,
      data.opacity || 1.0,
      data.label_position || 'top',
      data.hover_scale || 1.2,
      data.visible_distance || 0,
      data.always_visible !== false ? 1 : 0,
      data.background_color || null
    );

    return this.getById(id)!;
  }

  /**
   * Get all hotspots for a scene
   */
  getByScene(sceneId: string): Hotspot[] {
    const stmt = db.prepare(`
      SELECT * FROM navigation_edges 
      WHERE from_scene_id = ?
      ORDER BY created_at ASC
    `);
    const results = stmt.all(sceneId) as any[];
    
    // Map database fields to hotspot interface (JSON DB doesn't support aliases)
    const hotspots = results.map(row => ({
      id: row.id,
      from_scene_id: row.from_scene_id,
      to_scene_id: row.to_scene_id,
      yaw: row.hotspot_yaw,
      pitch: row.hotspot_pitch,
      target_yaw: row.target_yaw,
      target_pitch: row.target_pitch,
      label: row.label,
      icon_type: row.icon_type || 'navigation',
      icon_color: row.icon_color || '#10b981',
      title: row.title,
      description: row.description,
      media_type: row.media_type,
      media_url: row.media_url,
      custom_icon_url: row.custom_icon_url,
      is_locked: row.is_locked === 1,
      required_role: row.required_role,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      // NEW: Animation & Style fields
      animation_type: row.animation_type || 'pulse-ring',
      animation_speed: row.animation_speed || 1.0,
      animation_intensity: row.animation_intensity || 0.5,
      icon_size: row.icon_size || 1.0,
      opacity: row.opacity || 1.0,
      label_position: row.label_position || 'top',
      hover_scale: row.hover_scale || 1.2,
      visible_distance: row.visible_distance || 0,
      always_visible: row.always_visible !== undefined ? row.always_visible === 1 : true,
      background_color: row.background_color,
      created_at: row.created_at,
    }));
    
    console.log(`[HotspotService] Found ${hotspots.length} hotspots for scene ${sceneId}`);
    return hotspots;
  }

  /**
   * Get hotspot by ID
   */
  getById(id: string): Hotspot | undefined {
    const stmt = db.prepare(`SELECT * FROM navigation_edges WHERE id = ?`);
    const row = stmt.get(id) as any;
    
    if (!row) return undefined;
    
    // Map database fields to hotspot interface
    return {
      id: row.id,
      from_scene_id: row.from_scene_id,
      to_scene_id: row.to_scene_id,
      yaw: row.hotspot_yaw,
      pitch: row.hotspot_pitch,
      target_yaw: row.target_yaw,
      target_pitch: row.target_pitch,
      label: row.label,
      icon_type: row.icon_type || 'navigation',
      icon_color: row.icon_color || '#10b981',
      title: row.title,
      description: row.description,
      media_type: row.media_type,
      media_url: row.media_url,
      custom_icon_url: row.custom_icon_url,
      is_locked: row.is_locked === 1,
      required_role: row.required_role,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      // NEW: Animation & Style fields
      animation_type: row.animation_type || 'pulse-ring',
      animation_speed: row.animation_speed || 1.0,
      animation_intensity: row.animation_intensity || 0.5,
      icon_size: row.icon_size || 1.0,
      opacity: row.opacity || 1.0,
      label_position: row.label_position || 'top',
      hover_scale: row.hover_scale || 1.2,
      visible_distance: row.visible_distance || 0,
      always_visible: row.always_visible !== undefined ? row.always_visible === 1 : true,
      background_color: row.background_color,
      created_at: row.created_at,
    };
  }

  /**
   * Update hotspot
   */
  update(id: string, data: Partial<CreateHotspotData>): Hotspot | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.to_scene_id !== undefined) {
      fields.push('to_scene_id = ?');
      values.push(data.to_scene_id);
    }
    if (data.yaw !== undefined) {
      fields.push('hotspot_yaw = ?');
      values.push(data.yaw);
    }
    if (data.pitch !== undefined) {
      fields.push('hotspot_pitch = ?');
      values.push(data.pitch);
    }
    // NEW: Orientation fields
    if (data.target_yaw !== undefined) {
      fields.push('target_yaw = ?');
      values.push(data.target_yaw);
    }
    if (data.target_pitch !== undefined) {
      fields.push('target_pitch = ?');
      values.push(data.target_pitch);
    }
    // NEW: Metadata fields
    if (data.label !== undefined) {
      fields.push('label = ?');
      values.push(data.label);
    }
    if (data.icon_type !== undefined) {
      fields.push('icon_type = ?');
      values.push(data.icon_type);
    }
    if (data.icon_color !== undefined) {
      fields.push('icon_color = ?');
      values.push(data.icon_color);
    }
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.media_type !== undefined) {
      fields.push('media_type = ?');
      values.push(data.media_type);
    }
    if (data.media_url !== undefined) {
      fields.push('media_url = ?');
      values.push(data.media_url);
    }
    if (data.custom_icon_url !== undefined) {
      fields.push('custom_icon_url = ?');
      values.push(data.custom_icon_url);
    }
    if (data.is_locked !== undefined) {
      fields.push('is_locked = ?');
      values.push(data.is_locked ? 1 : 0);
    }
    if (data.required_role !== undefined) {
      fields.push('required_role = ?');
      values.push(data.required_role);
    }
    if (data.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(JSON.stringify(data.metadata));
    }
    
    // NEW: Animation & Style fields
    if (data.animation_type !== undefined) {
      fields.push('animation_type = ?');
      values.push(data.animation_type);
    }
    if (data.animation_speed !== undefined) {
      fields.push('animation_speed = ?');
      values.push(data.animation_speed);
    }
    if (data.animation_intensity !== undefined) {
      fields.push('animation_intensity = ?');
      values.push(data.animation_intensity);
    }
    if (data.icon_size !== undefined) {
      fields.push('icon_size = ?');
      values.push(data.icon_size);
    }
    if (data.opacity !== undefined) {
      fields.push('opacity = ?');
      values.push(data.opacity);
    }
    if (data.label_position !== undefined) {
      fields.push('label_position = ?');
      values.push(data.label_position);
    }
    if (data.hover_scale !== undefined) {
      fields.push('hover_scale = ?');
      values.push(data.hover_scale);
    }
    if (data.visible_distance !== undefined) {
      fields.push('visible_distance = ?');
      values.push(data.visible_distance);
    }
    if (data.always_visible !== undefined) {
      fields.push('always_visible = ?');
      values.push(data.always_visible ? 1 : 0);
    }
    if (data.background_color !== undefined) {
      fields.push('background_color = ?');
      values.push(data.background_color);
    }

    if (fields.length === 0) return existing;

    values.push(id);

    const stmt = db.prepare(`UPDATE navigation_edges SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  /**
   * Delete hotspot
   */
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM navigation_edges WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const hotspotService = new HotspotService();
