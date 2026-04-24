"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotspotMediaService = exports.HotspotMediaService = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const storage_1 = require("../config/storage");
const fs_1 = __importDefault(require("fs"));
class HotspotMediaService {
    /**
     * Add media to hotspot
     */
    create(data) {
        const id = (0, helpers_1.generateId)();
        const stmt = database_1.default.prepare(`
      INSERT INTO hotspot_media (id, hotspot_id, file_name, file_type, file_size, file_path, title, description, sort_order, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.hotspot_id, data.file_name, data.file_type, data.file_size || null, data.file_path, data.title || null, data.description || null, data.sort_order || 0, data.uploaded_by || null);
        return this.getById(id);
    }
    /**
     * Get all media for a hotspot
     */
    getByHotspot(hotspotId) {
        const stmt = database_1.default.prepare(`
      SELECT * FROM hotspot_media 
      WHERE hotspot_id = ? 
      ORDER BY sort_order ASC, created_at DESC
    `);
        const media = stmt.all(hotspotId);
        // Add file URLs
        return media.map(m => ({
            ...m,
            file_url: (0, storage_1.getFileUrl)(m.file_path),
            thumbnail_url: m.thumbnail_path ? (0, storage_1.getFileUrl)(m.thumbnail_path) : undefined,
        }));
    }
    /**
     * Get media by ID
     */
    getById(id) {
        const stmt = database_1.default.prepare('SELECT * FROM hotspot_media WHERE id = ?');
        const media = stmt.get(id);
        if (media) {
            return {
                ...media,
                file_url: (0, storage_1.getFileUrl)(media.file_path),
                thumbnail_url: media.thumbnail_path ? (0, storage_1.getFileUrl)(media.thumbnail_path) : undefined,
            };
        }
        return undefined;
    }
    /**
     * Update media metadata
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
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.sort_order !== undefined) {
            fields.push('sort_order = ?');
            values.push(data.sort_order);
        }
        if (fields.length === 0)
            return existing;
        values.push(id);
        const stmt = database_1.default.prepare(`UPDATE hotspot_media SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    /**
     * Delete media and file
     */
    delete(id) {
        const media = this.getById(id);
        if (!media)
            return false;
        // Delete file
        if (media.file_path && fs_1.default.existsSync(media.file_path)) {
            fs_1.default.unlinkSync(media.file_path);
        }
        // Delete thumbnail
        if (media.thumbnail_path && fs_1.default.existsSync(media.thumbnail_path)) {
            fs_1.default.unlinkSync(media.thumbnail_path);
        }
        const stmt = database_1.default.prepare('DELETE FROM hotspot_media WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    /**
     * Bulk delete media
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
     * Reorder media
     */
    reorder(hotspotId, mediaIds) {
        const stmt = database_1.default.prepare('UPDATE hotspot_media SET sort_order = ? WHERE id = ?');
        for (let i = 0; i < mediaIds.length; i++) {
            stmt.run(i, mediaIds[i]);
        }
        return true;
    }
}
exports.HotspotMediaService = HotspotMediaService;
exports.hotspotMediaService = new HotspotMediaService();
//# sourceMappingURL=hotspot-media.service.js.map