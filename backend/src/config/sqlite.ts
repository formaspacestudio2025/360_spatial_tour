import { DatabaseAdapter } from './database.adapter';
import path from 'path';

/**
 * SQLite Adapter for Module 12.2
 * Implements DatabaseAdapter interface using better-sqlite3
 *
 * To use:
 * 1. Install: npm install better-sqlite3
 * 2. Set DB_DRIVER=sqlite in .env
 * 3. Set SQLITE_PATH in .env (default: ./data/database.sqlite)
 */

let sqlite: any;
try {
  sqlite = require('better-sqlite3');
} catch (e) {
  console.warn('better-sqlite3 not installed. Run: npm install better-sqlite3');
}

export class SqliteAdapter implements DatabaseAdapter {
  private db: any;
  private tables: string[] = [
    'users', 'walkthroughs', 'scenes', 'navigation_edges', 'ai_tags',
    'issues', 'assets', 'versions', 'walkthrough_members', 'comments',
    'hotspot_media', 'hotspot_links', 'maintenance_schedules',
    'checklist_templates', 'inspections', 'organizations', 'work_orders',
    'asset_events'
  ];

  constructor(dbPath?: string) {
    if (!sqlite) {
      throw new Error('better-sqlite3 is not installed. Please run: npm install better-sqlite3');
    }
    const defaultPath = path.join(__dirname, '../../data/database.sqlite');
    const filePath = dbPath || process.env.SQLITE_PATH || defaultPath;

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite(filePath);
    this.initializeTables();
    console.log(`✅ SQLite database connected: ${filePath}`);
  }

  private initializeTables(): void {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS walkthroughs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        client TEXT,
        address TEXT,
        status TEXT DEFAULT 'draft',
        description TEXT,
        created_by TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS scenes (
        id TEXT PRIMARY KEY,
        walkthrough_id TEXT NOT NULL,
        image_path TEXT,
        image_url TEXT,
        thumbnail_path TEXT,
        thumbnail_url TEXT,
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0,
        position_z REAL DEFAULT 0,
        floor INTEGER DEFAULT 0,
        room_name TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL,
        nadir_image_path TEXT,
        nadir_image_url TEXT,
        nadir_scale REAL DEFAULT 1.0,
        nadir_rotation REAL DEFAULT 0,
        nadir_opacity REAL DEFAULT 1.0,
        ai_tag_count INTEGER DEFAULT 0,
        issue_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS navigation_edges (
        id TEXT PRIMARY KEY,
        from_scene_id TEXT NOT NULL,
        to_scene_id TEXT NOT NULL,
        hotspot_yaw REAL,
        hotspot_pitch REAL,
        label TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        walkthrough_id TEXT NOT NULL,
        scene_id TEXT NOT NULL,
        ai_tag_id TEXT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        title TEXT NOT NULL,
        description TEXT,
        view_angle TEXT,
        coordinates_3d TEXT,
        assigned_to TEXT,
        created_by TEXT,
        due_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        serial_number TEXT,
        scene_id TEXT,
        yaw REAL,
        pitch REAL,
        floor INTEGER,
        room TEXT,
        status TEXT DEFAULT 'active',
        walkthrough_id TEXT,
        org_id TEXT,
        property_id TEXT,
        purchase_date TEXT,
        purchase_price REAL,
        useful_life_years INTEGER DEFAULT 10,
        salvage_value REAL DEFAULT 0,
        warranty_date TEXT,
        documents TEXT,
        health_score REAL,
        compliance TEXT,
        transition_history TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS asset_events (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        metadata TEXT,
        user_id TEXT,
        user_name TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS work_orders (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        due_date TEXT,
        assigned_to TEXT,
        estimated_hours REAL,
        actual_hours REAL,
        parts_used TEXT,
        cost REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        inspector_id TEXT,
        status TEXT DEFAULT 'scheduled',
        started_at TEXT,
        completed_at TEXT,
        location_data TEXT,
        weather_conditions TEXT,
        checklist_template_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  read(): any {
    // Return a JSON-like object with all tables
    const result: any = {};
    for (const table of this.tables) {
      result[table] = this.query(table);
    }
    return result;
  }

  write(data: any): void {
    // Bulk write - for migration purposes
    for (const table of this.tables) {
      if (data[table]) {
        // Clear and re-insert (simplified approach)
        this.db.exec(`DELETE FROM ${table}`);
        for (const record of data[table]) {
          this.insert(table, record);
        }
      }
    }
  }

  query(table: string): any[] {
    try {
      const stmt = this.db.prepare(`SELECT * FROM ${table}`);
      return stmt.all() || [];
    } catch (e) {
      return [];
    }
  }

  findById(table: string, id: string): any {
    try {
      const stmt = this.db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
      return stmt.get(id) || null;
    } catch (e) {
      return null;
    }
  }

  insert(table: string, record: any): any {
    const keys = Object.keys(record);
    const placeholders = keys.map(() => '?').join(',');
    const values = keys.map(k => {
      const val = record[k];
      if (val === undefined) return null;
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });

    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(...values);
      return record;
    } catch (e: any) {
      console.error(`Insert failed for ${table}:`, e.message);
      throw e;
    }
  }

  update(table: string, id: string, data: any): any {
    const existing = this.findById(table, id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    const keys = Object.keys(updated).filter(k => k !== 'id');
    const setClause = keys.map(k => `${k} = ?`).join(',');
    const values = keys.map(k => {
      const val = updated[k];
      if (val === undefined) return null;
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(...values, id);
      return updated;
    } catch (e: any) {
      console.error(`Update failed for ${table}:`, e.message);
      throw e;
    }
  }

  delete(table: string, id: string): boolean {
    try {
      const stmt = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`);
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (e) {
      return false;
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

export default SqliteAdapter;
