import db from '../config/database';
import { generateId } from '../utils/helpers';
import { storagePaths, createWalkthroughStorage, getFileUrl } from '../config/storage';
import fs from 'fs';

export interface Scene {
  id: string;
  walkthrough_id: string;
  image_path: string;
  thumbnail_path?: string;
  position_x: number;
  position_y: number;
  position_z: number;
  floor: number;
  room_name?: string;
  notes?: string;
  metadata?: string;
  created_at: string;
  // Nadir fields
  nadir_image_path?: string;
  nadir_scale?: number;
  nadir_rotation?: number;
  nadir_opacity?: number;
}

export interface CreateSceneData {
  walkthrough_id: string;
  image_path: string;
  thumbnail_path?: string;
  position_x?: number;
  position_y?: number;
  position_z?: number;
  floor?: number;
  room_name?: string;
  notes?: string;
  metadata?: any;
  // Nadir fields
  nadir_image_path?: string;
  nadir_scale?: number;
  nadir_rotation?: number;
  nadir_opacity?: number;
}

export class SceneService {
  /**
   * Create a new scene
   */
  create(data: CreateSceneData): Scene {
    const id = generateId();
    
    // Ensure walkthrough storage exists
    createWalkthroughStorage(data.walkthrough_id);
    
    const stmt = db.prepare(`
      INSERT INTO scenes (id, walkthrough_id, image_path, thumbnail_path, position_x, position_y, position_z, floor, room_name, notes, metadata, nadir_image_path, nadir_scale, nadir_rotation, nadir_opacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.walkthrough_id,
      data.image_path,
      data.thumbnail_path || null,
      data.position_x || 0,
      data.position_y || 0,
      data.position_z || 0,
      data.floor || 1,
      data.room_name || null,
      data.notes || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.nadir_image_path || null,
      data.nadir_scale || 1.0,
      data.nadir_rotation || 0,
      data.nadir_opacity || 1.0
    );
    
    return this.getById(id)!;
  }

  /**
   * Get all scenes for a walkthrough
   */
  getByWalkthrough(walkthroughId: string): Scene[] {
    const stmt = db.prepare('SELECT * FROM scenes WHERE walkthrough_id = ? ORDER BY created_at ASC');
    return stmt.all(walkthroughId) as Scene[];
  }

  /**
   * Get scene by ID
   */
  getById(id: string): Scene | undefined {
    const stmt = db.prepare('SELECT * FROM scenes WHERE id = ?');
    return stmt.get(id) as Scene | undefined;
  }

  /**
   * Update scene
   */
  update(id: string, data: Partial<CreateSceneData>): Scene | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.position_x !== undefined) {
      fields.push('position_x = ?');
      values.push(data.position_x);
    }
    if (data.position_y !== undefined) {
      fields.push('position_y = ?');
      values.push(data.position_y);
    }
    if (data.position_z !== undefined) {
      fields.push('position_z = ?');
      values.push(data.position_z);
    }
    if (data.floor !== undefined) {
      fields.push('floor = ?');
      values.push(data.floor);
    }
    if (data.room_name !== undefined) {
      fields.push('room_name = ?');
      values.push(data.room_name);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(JSON.stringify(data.metadata));
    }
    // NEW: Nadir fields
    if (data.nadir_image_path !== undefined) {
      fields.push('nadir_image_path = ?');
      values.push(data.nadir_image_path);
    }
    if (data.nadir_scale !== undefined) {
      fields.push('nadir_scale = ?');
      values.push(data.nadir_scale);
    }
    if (data.nadir_rotation !== undefined) {
      fields.push('nadir_rotation = ?');
      values.push(data.nadir_rotation);
    }
    if (data.nadir_opacity !== undefined) {
      fields.push('nadir_opacity = ?');
      values.push(data.nadir_opacity);
    }

    if (fields.length === 0) return existing;

    values.push(id);

    const stmt = db.prepare(`UPDATE scenes SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  /**
   * Delete scene and remove files
   */
  delete(id: string): boolean {
    const scene = this.getById(id);
    if (!scene) return false;

    // Delete image file
    if (scene.image_path && fs.existsSync(scene.image_path)) {
      fs.unlinkSync(scene.image_path);
    }

    // Delete thumbnail file
    if (scene.thumbnail_path && fs.existsSync(scene.thumbnail_path)) {
      fs.unlinkSync(scene.thumbnail_path);
    }

    const stmt = db.prepare('DELETE FROM scenes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Get scene with AI tag count and issue count
   */
  getWithStats(id: string): (Scene & { ai_tag_count: number; issue_count: number }) | undefined {
    const stmt = db.prepare(`
      SELECT 
        s.*,
        COUNT(DISTINCT at.id) as ai_tag_count,
        COUNT(DISTINCT i.id) as issue_count
      FROM scenes s
      LEFT JOIN ai_tags at ON s.id = at.scene_id
      LEFT JOIN issues i ON s.id = i.scene_id
      WHERE s.id = ?
      GROUP BY s.id
    `);
    
    return stmt.get(id) as (Scene & { ai_tag_count: number; issue_count: number }) | undefined;
  }
}

export const sceneService = new SceneService();
