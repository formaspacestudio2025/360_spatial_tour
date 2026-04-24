"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotspotService = exports.HotspotService = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
class HotspotService {
    /**
     * Create a new hotspot
     */
    create(data) {
        const id = (0, helpers_1.generateId)();
        const stmt = database_1.default.prepare(`
      INSERT INTO navigation_edges (
        id, from_scene_id, to_scene_id, 
        hotspot_yaw, hotspot_pitch,
        target_yaw, target_pitch,
        label, icon_type, icon_color,
        title, description,
        media_type, media_url, custom_icon_url,
        is_locked, metadata,
        animation_type, animation_speed, animation_intensity,
        icon_size, opacity, label_position,
        hover_scale, visible_distance, always_visible,
        background_color
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.from_scene_id, data.to_scene_id, data.yaw, data.pitch, data.target_yaw || null, data.target_pitch || null, data.label || null, data.icon_type || 'navigation', data.icon_color || '#10b981', data.title || null, data.description || null, data.media_type || null, data.media_url || null, data.custom_icon_url || null, data.is_locked ? 1 : 0, data.metadata ? JSON.stringify(data.metadata) : null, data.animation_type || 'pulse-ring', data.animation_speed || 1.0, data.animation_intensity || 0.5, data.icon_size || 1.0, data.opacity || 1.0, data.label_position || 'top', data.hover_scale || 1.2, data.visible_distance || 0, data.always_visible !== false ? 1 : 0, data.background_color || null);
        return this.getById(id);
    }
    /**
     * Get all hotspots for a scene
     */
    getByScene(sceneId) {
        const stmt = database_1.default.prepare(`
      SELECT * FROM navigation_edges 
      WHERE from_scene_id = ?
      ORDER BY created_at ASC
    `);
        const results = stmt.all(sceneId);
        // Map database fields to hotspot interface (JSON DB doesn't support aliases)
        const hotspots = results.map(row => ({
            id: row.id,
            from_scene_id: row.from_scene_id,
            to_scene_id: row.to_scene_id,
            yaw: row.hotspot_yaw,
            pitch: row.hotspot_pitch,
            target_yaw: row.target_yaw,
            target_pitch: row.target_pitch,
            label: row.label,
            icon_type: row.icon_type || 'navigation',
            icon_color: row.icon_color || '#10b981',
            title: row.title,
            description: row.description,
            media_type: row.media_type,
            media_url: row.media_url,
            custom_icon_url: row.custom_icon_url,
            is_locked: row.is_locked === 1,
            metadata: row.metadata ? JSON.parse(row.metadata) : null,
            // NEW: Animation & Style fields
            animation_type: row.animation_type || 'pulse-ring',
            animation_speed: row.animation_speed || 1.0,
            animation_intensity: row.animation_intensity || 0.5,
            icon_size: row.icon_size || 1.0,
            opacity: row.opacity || 1.0,
            label_position: row.label_position || 'top',
            hover_scale: row.hover_scale || 1.2,
            visible_distance: row.visible_distance || 0,
            always_visible: row.always_visible !== undefined ? row.always_visible === 1 : true,
            background_color: row.background_color,
            created_at: row.created_at,
        }));
        console.log(`[HotspotService] Found ${hotspots.length} hotspots for scene ${sceneId}`);
        return hotspots;
    }
    /**
     * Get hotspot by ID
     */
    getById(id) {
        const stmt = database_1.default.prepare(`SELECT * FROM navigation_edges WHERE id = ?`);
        const row = stmt.get(id);
        if (!row)
            return undefined;
        // Map database fields to hotspot interface
        return {
            id: row.id,
            from_scene_id: row.from_scene_id,
            to_scene_id: row.to_scene_id,
            yaw: row.hotspot_yaw,
            pitch: row.hotspot_pitch,
            target_yaw: row.target_yaw,
            target_pitch: row.target_pitch,
            label: row.label,
            icon_type: row.icon_type || 'navigation',
            icon_color: row.icon_color || '#10b981',
            title: row.title,
            description: row.description,
            media_type: row.media_type,
            media_url: row.media_url,
            custom_icon_url: row.custom_icon_url,
            is_locked: row.is_locked === 1,
            metadata: row.metadata ? JSON.parse(row.metadata) : null,
            // NEW: Animation & Style fields
            animation_type: row.animation_type || 'pulse-ring',
            animation_speed: row.animation_speed || 1.0,
            animation_intensity: row.animation_intensity || 0.5,
            icon_size: row.icon_size || 1.0,
            opacity: row.opacity || 1.0,
            label_position: row.label_position || 'top',
            hover_scale: row.hover_scale || 1.2,
            visible_distance: row.visible_distance || 0,
            always_visible: row.always_visible !== undefined ? row.always_visible === 1 : true,
            background_color: row.background_color,
            created_at: row.created_at,
        };
    }
    /**
     * Update hotspot
     */
    update(id, data) {
        const existing = this.getById(id);
        if (!existing)
            return null;
        const fields = [];
        const values = [];
        if (data.to_scene_id !== undefined) {
            fields.push('to_scene_id = ?');
            values.push(data.to_scene_id);
        }
        if (data.yaw !== undefined) {
            fields.push('hotspot_yaw = ?');
            values.push(data.yaw);
        }
        if (data.pitch !== undefined) {
            fields.push('hotspot_pitch = ?');
            values.push(data.pitch);
        }
        // NEW: Orientation fields
        if (data.target_yaw !== undefined) {
            fields.push('target_yaw = ?');
            values.push(data.target_yaw);
        }
        if (data.target_pitch !== undefined) {
            fields.push('target_pitch = ?');
            values.push(data.target_pitch);
        }
        // NEW: Metadata fields
        if (data.label !== undefined) {
            fields.push('label = ?');
            values.push(data.label);
        }
        if (data.icon_type !== undefined) {
            fields.push('icon_type = ?');
            values.push(data.icon_type);
        }
        if (data.icon_color !== undefined) {
            fields.push('icon_color = ?');
            values.push(data.icon_color);
        }
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.media_type !== undefined) {
            fields.push('media_type = ?');
            values.push(data.media_type);
        }
        if (data.media_url !== undefined) {
            fields.push('media_url = ?');
            values.push(data.media_url);
        }
        if (data.custom_icon_url !== undefined) {
            fields.push('custom_icon_url = ?');
            values.push(data.custom_icon_url);
        }
        if (data.is_locked !== undefined) {
            fields.push('is_locked = ?');
            values.push(data.is_locked ? 1 : 0);
        }
        if (data.metadata !== undefined) {
            fields.push('metadata = ?');
            values.push(JSON.stringify(data.metadata));
        }
        // NEW: Animation & Style fields
        if (data.animation_type !== undefined) {
            fields.push('animation_type = ?');
            values.push(data.animation_type);
        }
        if (data.animation_speed !== undefined) {
            fields.push('animation_speed = ?');
            values.push(data.animation_speed);
        }
        if (data.animation_intensity !== undefined) {
            fields.push('animation_intensity = ?');
            values.push(data.animation_intensity);
        }
        if (data.icon_size !== undefined) {
            fields.push('icon_size = ?');
            values.push(data.icon_size);
        }
        if (data.opacity !== undefined) {
            fields.push('opacity = ?');
            values.push(data.opacity);
        }
        if (data.label_position !== undefined) {
            fields.push('label_position = ?');
            values.push(data.label_position);
        }
        if (data.hover_scale !== undefined) {
            fields.push('hover_scale = ?');
            values.push(data.hover_scale);
        }
        if (data.visible_distance !== undefined) {
            fields.push('visible_distance = ?');
            values.push(data.visible_distance);
        }
        if (data.always_visible !== undefined) {
            fields.push('always_visible = ?');
            values.push(data.always_visible ? 1 : 0);
        }
        if (data.background_color !== undefined) {
            fields.push('background_color = ?');
            values.push(data.background_color);
        }
        if (fields.length === 0)
            return existing;
        values.push(id);
        const stmt = database_1.default.prepare(`UPDATE navigation_edges SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    }
    /**
     * Delete hotspot
     */
    delete(id) {
        const stmt = database_1.default.prepare('DELETE FROM navigation_edges WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
exports.HotspotService = HotspotService;
exports.hotspotService = new HotspotService();
//# sourceMappingURL=hotspot.service.js.map