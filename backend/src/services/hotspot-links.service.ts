import db from '../config/database';
import { generateId } from '../utils/helpers';
import { getFileUrl } from '../config/storage';

export interface HotspotLink {
  id: string;
  hotspot_id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  favicon_url?: string;
  sort_order: number;
  created_at: string;
}

export interface CreateHotspotLinkData {
  hotspot_id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  sort_order?: number;
}

export class HotspotLinkService {
  /**
   * Create a link
   */
  create(data: CreateHotspotLinkData): HotspotLink {
    const id = generateId();
    
    // Validate URL format
    try {
      new URL(data.url);
    } catch {
      throw new Error('Invalid URL format');
    }
    
    const stmt = db.prepare(`
      INSERT INTO hotspot_links (id, hotspot_id, title, url, description, category, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.hotspot_id,
      data.title,
      data.url,
      data.description || null,
      data.category || 'custom',
      data.sort_order || 0
    );
    
    return this.getById(id)!;
  }

  /**
   * Get all links for a hotspot
   */
  getByHotspot(hotspotId: string): HotspotLink[] {
    const stmt = db.prepare(`
      SELECT * FROM hotspot_links 
      WHERE hotspot_id = ? 
      ORDER BY sort_order ASC, created_at DESC
    `);
    
    return stmt.all(hotspotId) as HotspotLink[];
  }

  /**
   * Get link by ID
   */
  getById(id: string): HotspotLink | undefined {
    const stmt = db.prepare('SELECT * FROM hotspot_links WHERE id = ?');
    return stmt.get(id) as HotspotLink | undefined;
  }

  /**
   * Update link
   */
  update(id: string, data: Partial<CreateHotspotLinkData>): HotspotLink | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.url !== undefined) {
      // Validate URL
      try {
        new URL(data.url);
      } catch {
        throw new Error('Invalid URL format');
      }
      fields.push('url = ?');
      values.push(data.url);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }

    if (fields.length === 0) return existing;

    values.push(id);

    const stmt = db.prepare(`UPDATE hotspot_links SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  /**
   * Delete link
   */
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM hotspot_links WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Bulk delete links
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
   * Reorder links
   */
  reorder(hotspotId: string, linkIds: string[]): boolean {
    const stmt = db.prepare('UPDATE hotspot_links SET sort_order = ? WHERE id = ?');
    
    for (let i = 0; i < linkIds.length; i++) {
      stmt.run(i, linkIds[i]);
    }
    
    return true;
  }
}

export const hotspotLinkService = new HotspotLinkService();
