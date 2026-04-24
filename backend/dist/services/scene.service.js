"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sceneService = exports.SceneService = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const storage_1 = require("../config/storage");
const fs_1 = __importDefault(require("fs"));
class SceneService {
    /**
     * Create a new scene
     */
    create(data) {
        const id = (0, helpers_1.generateId)();
        // Ensure walkthrough storage exists
        (0, storage_1.createWalkthroughStorage)(data.walkthrough_id);
        const stmt = database_1.default.prepare(`
      INSERT INTO scenes (id, walkthrough_id, image_path, thumbnail_path, position_x, position_y, position_z, floor, room_name, notes, metadata, nadir_image_path, nadir_scale, nadir_rotation, nadir_opacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.walkthrough_id, data.image_path, data.thumbnail_path || null, data.position_x || 0, data.position_y || 0, data.position_z || 0, data.floor || 1, data.room_name || null, data.notes || null, data.metadata ? JSON.stringify(data.metadata) : null, data.nadir_image_path || null, data.nadir_scale || 1.0, data.nadir_rotation || 0, data.nadir_opacity || 1.0);
        return this.getById(id);
    }
    /**
     * Get all scenes for a walkthrough
     */
    getByWalkthrough(walkthroughId) {
        const stmt = database_1.default.prepare('SELECT * FROM scenes WHERE walkthrough_id = ? ORDER BY created_at ASC');
        return stmt.all(walkthroughId);
    }
    /**
     * Get scene by ID
     */
    getById(id) {
        const stmt = database_1.default.prepare('SELECT * FROM scenes WHERE id = ?');
        return stmt.get(id);
    }
    /**
     * Update scene
     */
    update(id, data) {
        const existing = this.getById(id);
        if (!existing)
            return null;
        const fields = [];
        const values = [];
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
        if (fields.length === 0)
            return existing;
        values.push(id);
        const stmt = database_1.default.prepare(`UPDATE scenes SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    /**
     * Delete scene and remove files
     */
    delete(id) {
        const scene = this.getById(id);
        if (!scene)
            return false;
        // Delete image file
        if (scene.image_path && fs_1.default.existsSync(scene.image_path)) {
            fs_1.default.unlinkSync(scene.image_path);
        }
        // Delete thumbnail file
        if (scene.thumbnail_path && fs_1.default.existsSync(scene.thumbnail_path)) {
            fs_1.default.unlinkSync(scene.thumbnail_path);
        }
        const stmt = database_1.default.prepare('DELETE FROM scenes WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    /**
     * Get scene with AI tag count and issue count
     */
    getWithStats(id) {
        const stmt = database_1.default.prepare(`
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
        return stmt.get(id);
    }
}
exports.SceneService = SceneService;
exports.sceneService = new SceneService();
//# sourceMappingURL=scene.service.js.map