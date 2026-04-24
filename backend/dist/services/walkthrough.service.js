"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkthroughService = exports.WalkthroughService = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
class WalkthroughService {
    /**
     * Create a new walkthrough
     */
    create(data) {
        const id = (0, helpers_1.generateId)();
        const status = data.status || 'draft';
        const stmt = database_1.default.prepare(`
      INSERT INTO walkthroughs (id, name, client, address, status, description, created_by, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.name, data.client || null, data.address || null, status, data.description || null, data.created_by || null, data.latitude || null, data.longitude || null);
        return this.getById(id);
    }
    /**
     * Get all walkthroughs with optional search and filter
     */
    getAll(query) {
        const stmt = database_1.default.prepare('SELECT * FROM walkthroughs ORDER BY created_at DESC');
        let results = stmt.all();
        // Add scene count to each walkthrough
        const sceneStmt = database_1.default.prepare('SELECT COUNT(*) as count FROM scenes WHERE walkthrough_id = ?');
        let walkthroughsWithCounts = results.map(walkthrough => {
            const sceneResult = sceneStmt.get(walkthrough.id);
            return {
                ...walkthrough,
                scene_count: sceneResult.count,
            };
        });
        if (query) {
            // Search by name, client, or address (case-insensitive)
            if (query.search) {
                const searchLower = query.search.toLowerCase();
                walkthroughsWithCounts = walkthroughsWithCounts.filter(w => w.name?.toLowerCase().includes(searchLower) ||
                    w.client?.toLowerCase().includes(searchLower) ||
                    w.address?.toLowerCase().includes(searchLower));
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
    getClients() {
        const stmt = database_1.default.prepare('SELECT * FROM walkthroughs ORDER BY created_at DESC');
        const results = stmt.all();
        const clients = [...new Set(results.map(w => w.client).filter(Boolean))];
        return clients;
    }
    /**
     * Get walkthrough by ID
     */
    getById(id) {
        const stmt = database_1.default.prepare('SELECT * FROM walkthroughs WHERE id = ?');
        return stmt.get(id);
    }
    /**
     * Update walkthrough
     */
    update(id, data) {
        const existing = this.getById(id);
        if (!existing)
            return null;
        const fields = [];
        const values = [];
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
        if (fields.length === 0)
            return existing;
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        const stmt = database_1.default.prepare(`UPDATE walkthroughs SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    /**
     * Delete walkthrough
     */
    delete(id) {
        const stmt = database_1.default.prepare('DELETE FROM walkthroughs WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    /**
     * Get walkthrough with scene count
     */
    getWithStats(id) {
        const walkthrough = this.getById(id);
        if (!walkthrough)
            return undefined;
        const sceneStmt = database_1.default.prepare('SELECT * FROM scenes WHERE walkthrough_id = ?');
        const scenes = sceneStmt.all(id);
        return {
            ...walkthrough,
            scene_count: scenes.length,
        };
    }
}
exports.WalkthroughService = WalkthroughService;
exports.walkthroughService = new WalkthroughService();
//# sourceMappingURL=walkthrough.service.js.map