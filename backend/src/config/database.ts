import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/db.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database structure
interface Database {
  users: any[];
  walkthroughs: any[];
  scenes: any[];
  navigation_edges: any[];
  ai_tags: any[];
  issues: any[];
  assets: any[];
  versions: any[];
  walkthrough_members: any[];
  comments: any[];
  hotspot_media: any[];
  hotspot_links: any[];
  maintenance_schedules: any[];
  checklist_templates: any[];
  inspections: any[];
  organizations: any[];
}

// Load or create database
let db: Database = {
  users: [],
  walkthroughs: [],
  scenes: [],
  navigation_edges: [],
  ai_tags: [],
  issues: [],
  assets: [],
  versions: [],
  walkthrough_members: [],
  comments: [],
  hotspot_media: [],
  hotspot_links: [],
  maintenance_schedules: [],
  checklist_templates: [],
  inspections: [],
  organizations: [],
};

if (fs.existsSync(DB_PATH)) {
  const loaded = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  db = { ...db, ...loaded };
  console.log('✅ Database loaded from file');
} else {
  console.log('✅ New database created');
}

// Save database to file
function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Statement wrapper
class Statement {
  private table: string;
  private sql: string;
  private isSelect: boolean;
  private isInsert: boolean;
  private isUpdate: boolean;
  private isDelete: boolean;

  constructor(table: string, sql: string) {
    this.table = table;
    this.sql = sql;
    this.isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    this.isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    this.isUpdate = sql.trim().toUpperCase().startsWith('UPDATE');
    this.isDelete = sql.trim().toUpperCase().startsWith('DELETE');
  }

  get(...params: any[]): any {
    if (!this.isSelect) return undefined;
    const table = db[this.table as keyof Database] as any[];
    if (this.sql.includes('WHERE id = ?')) {
      return table.find((row: any) => row.id === params[0]);
    }
    return table[0];
  }

  all(...params: any[]): any[] {
    if (!this.isSelect) return [];
    let table = db[this.table as keyof Database] as any[];

    if (this.sql.includes('walkthrough_id = ?')) {
      table = table.filter((row: any) => row.walkthrough_id === params[0]);
    }
    if (this.sql.includes('from_scene_id = ?')) {
      table = table.filter((row: any) => row.from_scene_id === params[0]);
    }
    if (this.sql.includes('scene_id = ?') && !this.sql.includes('from_scene_id = ?')) {
      table = table.filter((row: any) => row.scene_id === params[0]);
    }
    if (this.sql.includes('asset_id = ?')) {
      table = table.filter((row: any) => row.asset_id === params[0]);
    }
    if (this.sql.includes('ORDER BY created_at DESC')) {
      table = [...table].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return table;
  }

  run(...params: any[]): any {
    const table = db[this.table as keyof Database] as any[];

    if (this.isInsert) {
      const valuesMatch = this.sql.match(/\(([^)]+)\)\s*VALUES/i);
      if (valuesMatch) {
        const columns = valuesMatch[1].split(',').map(c => c.trim());
        const newRow: any = {};
        columns.forEach((col: string, i: number) => {
          newRow[col] = params[i];
        });
        newRow.created_at = new Date().toISOString();
        newRow.updated_at = new Date().toISOString();
        table.push(newRow);
        save();
        return { changes: 1, lastInsertRowid: newRow.id };
      }
    }

    if (this.isUpdate) {
      const whereMatch = this.sql.match(/WHERE id = \?$/i);
      if (whereMatch) {
        const id = params[params.length - 1];
        const setMatch = this.sql.match(/SET\s+([\s\S]+?)\s+WHERE/i);
        if (setMatch) {
          const columns = setMatch[1].split(',').map(c => c.trim().split('=')[0].trim());
          const row = table.find((r: any) => r.id === id);
          if (row) {
            columns.forEach((col: string, i: number) => {
              row[col] = params[i];
            });
            row.updated_at = new Date().toISOString();
            save();
            return { changes: 1 };
          }
        }
      }
    }

    if (this.isDelete) {
      const id = params[0];
      const index = table.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        table.splice(index, 1);
        save();
        return { changes: 1 };
      }
    }

    return { changes: 0 };
  }
}

// Database wrapper
const database = {
  get tables() { return db; },
  prepare(sql: string) {
    const tableMatch = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : '';
    return new Statement(table, sql);
  },

  run(sql: string, params: any[] = []) {
    if (sql.includes('CREATE TABLE') || sql.includes('CREATE INDEX')) {
      return;
    }
  },

  exec(sql: string) {
    // Ignore schema SQL
  },

  pragma(query: string) {
    return null;
  },

  transaction(fn: Function) {
    return (...args: any[]) => {
      return fn(...args);
    };
  }
};

export default database;
export { db, save };
