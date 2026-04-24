"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotspot_service_1 = require("../services/hotspot.service");
const error_1 = require("../middleware/error");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/scenes/:sceneId/hotspots - Get hotspots for a scene
router.get('/scenes/:sceneId/hotspots', (req, res) => {
    try {
        const hotspots = hotspot_service_1.hotspotService.getByScene(req.params.sceneId);
        res.json({
            success: true,
            data: hotspots,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch hotspots', 500);
    }
});
// POST /api/scenes/:sceneId/hotspots - Create hotspot (editor+)
router.post('/scenes/:sceneId/hotspots', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), (req, res) => {
    try {
        const { to_scene_id, yaw, pitch, label } = req.body;
        if (!to_scene_id || yaw === undefined || pitch === undefined) {
            throw new error_1.AppError('to_scene_id, yaw, and pitch are required', 400);
        }
        const hotspot = hotspot_service_1.hotspotService.create({
            from_scene_id: req.params.sceneId,
            to_scene_id,
            yaw: parseFloat(yaw),
            pitch: parseFloat(pitch),
            label,
        });
        res.status(201).json({
            success: true,
            data: hotspot,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to create hotspot', 500);
    }
});
// PUT /api/hotspots/:id - Update hotspot (editor+)
router.put('/hotspots/:id', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), (req, res) => {
    try {
        const hotspot = hotspot_service_1.hotspotService.update(req.params.id, req.body);
        if (!hotspot) {
            throw new error_1.AppError('Hotspot not found', 404);
        }
        res.json({
            success: true,
            data: hotspot,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to update hotspot', 500);
    }
});
// DELETE /api/hotspots/:id - Delete hotspot (editor+)
router.delete('/hotspots/:id', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), (req, res) => {
    try {
        const deleted = hotspot_service_1.hotspotService.delete(req.params.id);
        if (!deleted) {
            throw new error_1.AppError('Hotspot not found', 404);
        }
        res.json({
            success: true,
            message: 'Hotspot deleted successfully',
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to delete hotspot', 500);
    }
});
exports.default = router;
//# sourceMappingURL=hotspots.js.map