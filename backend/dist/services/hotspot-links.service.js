"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotspotLinkService = exports.HotspotLinkService = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
class HotspotLinkService {
    /**
     * Create a link
     */
    create(data) {
        const id = (0, helpers_1.generateId)();
        // Validate URL format
        try {
            new URL(data.url);
        }
        catch {
            throw new Error('Invalid URL format');
        }
        const stmt = database_1.default.prepare(`
      INSERT INTO hotspot_links (id, hotspot_id, title, url, description, category, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.hotspot_id, data.title, data.url, data.description || null, data.category || 'custom', data.sort_order || 0);
        return this.getById(id);
    }
    /**
     * Get all links for a hotspot
     */
    getByHotspot(hotspotId) {
        const stmt = database_1.default.prepare(`
      SELECT * FROM hotspot_links 
      WHERE hotspot_id = ? 
      ORDER BY sort_order ASC, created_at DESC
    `);
        return stmt.all(hotspotId);
    }
    /**
     * Get link by ID
     */
    getById(id) {
        const stmt = database_1.default.prepare('SELECT * FROM hotspot_links WHERE id = ?');
        return stmt.get(id);
    }
    /**
     * Update link
     */
    update(id, data) {
        const existing = this.getById(id);
        if (!existing)
            return null;
        const fields = [];
        const values = [];
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.url !== undefined) {
            // Validate URL
            try {
                new URL(data.url);
            }
            catch {
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
        if (fields.length === 0)
            return existing;
        values.push(id);
        const stmt = database_1.default.prepare(`UPDATE hotspot_links SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    /**
     * Delete link
     */
    delete(id) {
        const stmt = database_1.default.prepare('DELETE FROM hotspot_links WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    /**
     * Bulk delete links
     */
    bulkDelete(ids) {
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
    reorder(hotspotId, linkIds) {
        const stmt = database_1.default.prepare('UPDATE hotspot_links SET sort_order = ? WHERE id = ?');
        for (let i = 0; i < linkIds.length; i++) {
            stmt.run(i, linkIds[i]);
        }
        return true;
    }
}
exports.HotspotLinkService = HotspotLinkService;
exports.hotspotLinkService = new HotspotLinkService();
//# sourceMappingURL=hotspot-links.service.js.map