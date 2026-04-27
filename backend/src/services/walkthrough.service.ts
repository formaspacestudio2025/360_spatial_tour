import db from '../config/database';
import { generateId } from '../utils/helpers';

export interface Walkthrough {
  org_id?: string; // organization owner
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
}

export interface CreateWalkthroughData {
  name: string;
  client?: string;
  address?: string;
  status?: 'draft' | 'active' | 'archived';
  description?: string;
  created_by?: string;
  latitude?: number;
  longitude?: number;
}

export interface WalkthroughQuery {
  search?: string;
  status?: string;
  client?: string;
}

export class WalkthroughService {
  /**
   * Create a new walkthrough
   */
  create(data: CreateWalkthroughData): Walkthrough {
    const id = generateId();
    const status = data.status || 'draft';
    
    const stmt = db.prepare(`
      INSERT INTO walkthroughs (id, name, client, address, status, description, created_by, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.name,
      data.client || null,
      data.address || null,
      status,
      data.description || null,
      data.created_by || null,
      data.latitude || null,
      data.longitude || null
    );
    
    return this.getById(id)!;
  }

  /**
   * Get all walkthroughs with optional search and filter
   */
  getAll(query?: WalkthroughQuery): (Walkthrough & { scene_count: number })[] {
    const stmt = db.prepare('SELECT * FROM walkthroughs ORDER BY created_at DESC');
    let results = stmt.all() as Walkthrough[];

    // Add scene count to each walkthrough
    const sceneStmt = db.prepare('SELECT COUNT(*) as count FROM scenes WHERE walkthrough_id = ?');
    let walkthroughsWithCounts: (Walkthrough & { scene_count: number })[] = results.map(walkthrough => {
      const sceneResult = sceneStmt.get(walkthrough.id) as { count: number };
      return {
        ...walkthrough,
        scene_count: sceneResult.count,
      };
    });

    if (query) {
      // Search by name, client, or address (case-insensitive)
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        walkthroughsWithCounts = walkthroughsWithCounts.filter(w => 
          w.name?.toLowerCase().includes(searchLower) ||
          w.client?.toLowerCase().includes(searchLower) ||
          w.address?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by status
      if (query.status) {
        walkthroughsWithCounts = walkthroughsWithCounts.filter(w => w.status === query.status);
      }

      // Filter by client
      if (query.client) {
        walkthroughsWithCounts = walkthroughsWithCounts.filter(w => w.client === query.client);
      }
    }

    return walkthroughsWithCounts;
  }

  /**
   * Get unique clients for filter dropdown
   */
  getClients(): string[] {
    const stmt = db.prepare('SELECT * FROM walkthroughs ORDER BY created_at DESC');
    const results = stmt.all() as Walkthrough[];
    const clients = [...new Set(results.map(w => w.client).filter(Boolean))];
    return clients as string[];
  }

  /**
   * Get walkthrough by ID
   */
  getById(id: string): Walkthrough | undefined {
    const stmt = db.prepare('SELECT * FROM walkthroughs WHERE id = ?');
    return stmt.get(id) as Walkthrough | undefined;
  }

  /**
   * Update walkthrough
   */
  update(id: string, data: Partial<CreateWalkthroughData>): Walkthrough | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.client !== undefined) {
      fields.push('client = ?');
      values.push(data.client);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(data.longitude);
    }

    if (fields.length === 0) return existing;

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`UPDATE walkthroughs SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  /**
   * Delete walkthrough
   */
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM walkthroughs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Get walkthrough with scene count
   */
  getWithStats(id: string): (Walkthrough & { scene_count: number }) | undefined {
    const walkthrough = this.getById(id);
    if (!walkthrough) return undefined;

    const sceneStmt = db.prepare('SELECT * FROM scenes WHERE walkthrough_id = ?');
    const scenes = sceneStmt.all(id);

    return {
      ...walkthrough,
      scene_count: scenes.length,
    };
  }
}

export const walkthroughService = new WalkthroughService();
