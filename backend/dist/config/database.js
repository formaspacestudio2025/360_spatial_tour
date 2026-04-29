"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../../data/db.json');
// Ensure data directory exists
const dataDir = path_1.default.dirname(DB_PATH);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Load or create database
let db = {
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
    hotspot_media: [], // NEW
    hotspot_links: [], // NEW
    organizations: [] // NEW: Organization model
};
if (fs_1.default.existsSync(DB_PATH)) {
    const loaded = JSON.parse(fs_1.default.readFileSync(DB_PATH, 'utf-8'));
    db = { ...db, ...loaded }; // Merge with defaults to ensure all keys exist
    console.log('✅ Database loaded from file');
}
else {
    console.log('✅ New database created');
}
// Save database to file
function save() {
    fs_1.default.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
// Statement wrapper
class Statement {
    constructor(table, sql) {
        this.table = table;
        this.sql = sql;
        this.isSelect = sql.trim().toUpperCase().startsWith('SELECT');
        this.isInsert = sql.trim().toUpperCase().startsWith('INSERT');
        this.isUpdate = sql.trim().toUpperCase().startsWith('UPDATE');
        this.isDelete = sql.trim().toUpperCase().startsWith('DELETE');
    }
    get(...params) {
        if (!this.isSelect)
            return undefined;
        const table = db[this.table];
        // WHERE id = ?
        if (this.sql.includes('WHERE id = ?')) {
            return table.find((row) => row.id === params[0]);
        }
        return table[0];
    }
    all(...params) {
        if (!this.isSelect)
            return [];
        let table = db[this.table];
        // WHERE walkthrough_id = ?
        if (this.sql.includes('walkthrough_id = ?')) {
            table = table.filter((row) => row.walkthrough_id === params[0]);
        }
        // WHERE from_scene_id = ? (for hotspots)
        if (this.sql.includes('from_scene_id = ?')) {
            table = table.filter((row) => row.from_scene_id === params[0]);
        }
        // WHERE scene_id = ?
        if (this.sql.includes('scene_id = ?') && !this.sql.includes('from_scene_id = ?')) {
            table = table.filter((row) => row.scene_id === params[0]);
        }
        // ORDER BY created_at DESC
        if (this.sql.includes('ORDER BY created_at DESC')) {
            table = [...table].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return table;
    }
    run(...params) {
        const table = db[this.table];
        // INSERT
        if (this.isInsert) {
            const valuesMatch = this.sql.match(/\(([^)]+)\)\s*VALUES/i);
            if (valuesMatch) {
                const columns = valuesMatch[1].split(',').map(c => c.trim());
                const newRow = {};
                columns.forEach((col, i) => {
                    newRow[col] = params[i];
                });
                newRow.created_at = new Date().toISOString();
                newRow.updated_at = new Date().toISOString();
                table.push(newRow);
                save();
                return { changes: 1, lastInsertRowid: newRow.id };
            }
        }
        // UPDATE
        if (this.isUpdate) {
            // UPDATE table SET col1=?, col2=? WHERE id=?
            const whereMatch = this.sql.match(/WHERE id = \?$/i);
            if (whereMatch) {
                const id = params[params.length - 1];
                const setMatch = this.sql.match(/SET\s+(.+?)\s+WHERE/i);
                if (setMatch) {
                    const columns = setMatch[1].split(',').map(c => c.trim().split('=')[0].trim());
                    const row = table.find((r) => r.id === id);
                    if (row) {
                        columns.forEach((col, i) => {
                            row[col] = params[i];
                        });
                        row.updated_at = new Date().toISOString();
                        save();
                        return { changes: 1 };
                    }
                }
            }
        }
        // DELETE
        if (this.isDelete) {
            const id = params[0];
            const index = table.findIndex((r) => r.id === id);
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
    prepare(sql) {
        // Extract table name from SQL
        const tableMatch = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
        const table = tableMatch ? tableMatch[1] : '';
        return new Statement(table, sql);
    },
    run(sql, params = []) {
        // For simple SQL like schema creation
        if (sql.includes('CREATE TABLE') || sql.includes('CREATE INDEX')) {
            // Ignore - we don't need schema for JSON
            return;
        }
    },
    exec(sql) {
        // Ignore schema SQL
    },
    pragma(query) {
        return null;
    },
    transaction(fn) {
        return (...args) => {
            return fn(...args);
        };
    }
};
console.log('✅ JSON Database initialized');
exports.default = database;
//# sourceMappingURL=database.js.map