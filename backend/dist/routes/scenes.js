"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scene_service_1 = require("../services/scene.service");
const storage_service_1 = require("../services/storage.service");
const storage_1 = require("../config/storage");
const upload_1 = require("../middleware/upload");
const error_1 = require("../middleware/error");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/walkthroughs/:walkthroughId/scenes - Get all scenes
router.get('/walkthroughs/:walkthroughId/scenes', (req, res) => {
    try {
        const scenes = scene_service_1.sceneService.getByWalkthrough(req.params.walkthroughId);
        // Add image URLs to each scene
        const scenesWithUrls = scenes.map(scene => {
            const imageUrl = (0, storage_1.getFileUrl)(scene.image_path);
            const thumbnailUrl = scene.thumbnail_path ? (0, storage_1.getFileUrl)(scene.thumbnail_path) : null;
            const nadirImageUrl = scene.nadir_image_path ? (0, storage_1.getFileUrl)(scene.nadir_image_path) : null;
            console.log(`Scene ${scene.id}: image_path=${scene.image_path}, image_url=${imageUrl}, nadir=${scene.nadir_image_path}`);
            return {
                ...scene,
                image_url: imageUrl,
                thumbnail_url: thumbnailUrl,
                nadir_image_url: nadirImageUrl,
            };
        });
        res.json({
            success: true,
            data: scenesWithUrls,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch scenes', 500);
    }
});
// POST /api/walkthroughs/:walkthroughId/scenes - Upload scene(s) (editor+)
router.post('/walkthroughs/:walkthroughId/scenes', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), upload_1.upload.array('images', 20), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new error_1.AppError('No image files uploaded', 400);
        }
        const walkthroughId = req.params.walkthroughId;
        const files = req.files;
        const roomNames = req.body.room_names ? JSON.parse(req.body.room_names) : {};
        const floors = req.body.floors ? JSON.parse(req.body.floors) : {};
        const notesList = req.body.notes ? JSON.parse(req.body.notes) : {};
        const createdScenes = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Save file to permanent storage
            const imagePath = await storage_service_1.storageService.saveFile(walkthroughId, file, 'scenes');
            // Generate thumbnail
            let thumbnailPath;
            try {
                thumbnailPath = await storage_service_1.storageService.generateThumbnail(walkthroughId, imagePath);
            }
            catch (error) {
                console.warn('Thumbnail generation failed:', error);
            }
            // Create scene in database
            const sceneData = {
                walkthrough_id: walkthroughId,
                image_path: imagePath,
                thumbnail_path: thumbnailPath,
                room_name: roomNames[i] || undefined,
                floor: floors[i] ? parseInt(floors[i]) : 1,
                notes: notesList[i] || undefined,
            };
            const scene = scene_service_1.sceneService.create(sceneData);
            createdScenes.push({
                ...scene,
                image_url: (0, storage_1.getFileUrl)(imagePath),
                thumbnail_url: thumbnailPath ? (0, storage_1.getFileUrl)(thumbnailPath) : null,
            });
        }
        res.status(201).json({
            success: true,
            data: createdScenes,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/scenes/:id - Get scene by ID
router.get('/scenes/:id', (req, res) => {
    try {
        const scene = scene_service_1.sceneService.getWithStats(req.params.id);
        if (!scene) {
            throw new error_1.AppError('Scene not found', 404);
        }
        res.json({
            success: true,
            data: {
                ...scene,
                image_url: (0, storage_1.getFileUrl)(scene.image_path),
                thumbnail_url: scene.thumbnail_path ? (0, storage_1.getFileUrl)(scene.thumbnail_path) : null,
                nadir_image_url: scene.nadir_image_path ? (0, storage_1.getFileUrl)(scene.nadir_image_path) : null,
            },
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to fetch scene', 500);
    }
});
// PUT /api/scenes/:id - Update scene
router.put('/scenes/:id', (req, res) => {
    try {
        const scene = scene_service_1.sceneService.update(req.params.id, req.body);
        if (!scene) {
            throw new error_1.AppError('Scene not found', 404);
        }
        res.json({
            success: true,
            data: {
                ...scene,
                image_url: (0, storage_1.getFileUrl)(scene.image_path),
                thumbnail_url: scene.thumbnail_path ? (0, storage_1.getFileUrl)(scene.thumbnail_path) : null,
                nadir_image_url: scene.nadir_image_path ? (0, storage_1.getFileUrl)(scene.nadir_image_path) : null,
            },
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to update scene', 500);
    }
});
// DELETE /api/scenes/:id - Delete scene (manager+)
router.delete('/scenes/:id', auth_1.authenticate, (0, auth_1.requireRole)('manager', 'admin'), (req, res) => {
    try {
        const deleted = scene_service_1.sceneService.delete(req.params.id);
        if (!deleted) {
            throw new error_1.AppError('Scene not found', 404);
        }
        res.json({
            success: true,
            message: 'Scene deleted successfully',
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to delete scene', 500);
    }
});
// POST /api/scenes/:id/upload-nadir - Upload nadir image (editor+)
router.post('/scenes/:id/upload-nadir', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), upload_1.upload.single('nadir'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new error_1.AppError('No nadir image uploaded', 400);
        }
        const sceneId = req.params.id;
        const nadirPath = req.file.path;
        // Update scene with nadir image path
        const scene = scene_service_1.sceneService.update(sceneId, {
            nadir_image_path: nadirPath,
        });
        if (!scene) {
            throw new error_1.AppError('Scene not found', 404);
        }
        res.json({
            success: true,
            data: {
                nadir_image_path: nadirPath,
                nadir_image_url: (0, storage_1.getFileUrl)(nadirPath),
            },
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to upload nadir image', 500);
    }
});
exports.default = router;
//# sourceMappingURL=scenes.js.map