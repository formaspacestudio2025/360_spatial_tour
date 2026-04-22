import db from '../config/database';
import { generateId } from '../utils/helpers';
import { storageService } from '../services/storage.service';
import { getFileUrl } from '../config/storage';
import fs from 'fs';

export interface HotspotMedia {
  id: string;
  hotspot_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  file_path: string;
  file_url?: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  sort_order: number;
  uploaded_by?: string;
  created_at: string;
}

export interface CreateHotspotMediaData {
  hotspot_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  file_path: string;
  title?: string;
  description?: string;
  sort_order?: number;
  uploaded_by?: string;
}

export class HotspotMediaService {
  /**
   * Add media to hotspot
   */
  create(data: CreateHotspotMediaData): HotspotMedia {
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO hotspot_media (id, hotspot_id, file_name, file_type, file_size, file_path, title, description, sort_order, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.hotspot_id,
      data.file_name,
      data.file_type,
      data.file_size || null,
      data.file_path,
      data.title || null,
      data.description || null,
      data.sort_order || 0,
      data.uploaded_by || null
    );
    
    return this.getById(id)!;
  }

  /**
   * Get all media for a hotspot
   */
  getByHotspot(hotspotId: string): HotspotMedia[] {
    const stmt = db.prepare(`
      SELECT * FROM hotspot_media 
      WHERE hotspot_id = ? 
      ORDER BY sort_order ASC, created_at DESC
    `);
    
    const media = stmt.all(hotspotId) as HotspotMedia[];
    
    // Add file URLs
    return media.map(m => ({
      ...m,
      file_url: getFileUrl(m.file_path),
      thumbnail_url: m.thumbnail_path ? getFileUrl(m.thumbnail_path) : undefined,
    }));
  }

  /**
   * Get media by ID
   */
  getById(id: string): HotspotMedia | undefined {
    const stmt = db.prepare('SELECT * FROM hotspot_media WHERE id = ?');
    const media = stmt.get(id) as HotspotMedia | undefined;
    
    if (media) {
      return {
        ...media,
        file_url: getFileUrl(media.file_path),
        thumbnail_url: media.thumbnail_path ? getFileUrl(media.thumbnail_path) : undefined,
      };
    }
    
    return undefined;
  }

  /**
   * Update media metadata
   */
  update(id: string, data: Partial<CreateHotspotMediaData>): HotspotMedia | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }

    if (fields.length === 0) return existing;

    values.push(id);

    const stmt = db.prepare(`UPDATE hotspot_media SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  /**
   * Delete media and file
   */
  delete(id: string): boolean {
    const media = this.getById(id);
    if (!media) return false;

    // Delete file
    if (media.file_path && fs.existsSync(media.file_path)) {
      fs.unlinkSync(media.file_path);
    }

    // Delete thumbnail
    if (media.thumbnail_path && fs.existsSync(media.thumbnail_path)) {
      fs.unlinkSync(media.thumbnail_path);
    }

    const stmt = db.prepare('DELETE FROM hotspot_media WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Bulk delete media
   */
  bulkDelete(ids: string[]): number {
    let deleted = 0;
    
    for (const id of ids) {
      if (this.delete(id)) {
        deleted++;
      }
    }
    
    return deleted;
  }

  /**
   * Reorder media
   */
  reorder(hotspotId: string, mediaIds: string[]): boolean {
    const stmt = db.prepare('UPDATE hotspot_media SET sort_order = ? WHERE id = ?');
    
    for (let i = 0; i < mediaIds.length; i++) {
      stmt.run(i, mediaIds[i]);
    }
    
    return true;
  }
}

export const hotspotMediaService = new HotspotMediaService();
