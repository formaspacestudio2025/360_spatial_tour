"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_service_1 = require("../services/ai.service");
const error_1 = require("../middleware/error");
const router = (0, express_1.Router)();
// POST /api/ai/config - Set LM Studio config
router.post('/ai/config', (req, res) => {
    try {
        const result = ai_service_1.aiService.setConfig(req.body);
        res.json({ success: true, data: result });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to set AI config', 500);
    }
});
// GET /api/ai/config - Get LM Studio config
router.get('/ai/config', (req, res) => {
    try {
        const config = ai_service_1.aiService.getConfig();
        res.json({ success: true, data: config });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to get AI config', 500);
    }
});
// POST /api/ai/test - Test LM Studio connection
router.post('/ai/test', async (req, res, next) => {
    try {
        const result = await ai_service_1.aiService.testConnection();
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/walkthroughs/:id/ai/process - Process single scene
router.post('/walkthroughs/:id/scenes/:sceneId/ai/process', async (req, res, next) => {
    try {
        const result = await ai_service_1.aiService.processScene(req.params.sceneId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/walkthroughs/:id/ai/process-all - Process all scenes
router.post('/walkthroughs/:id/ai/process-all', async (req, res, next) => {
    try {
        const result = await ai_service_1.aiService.processWalkthrough(req.params.id);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/walkthroughs/:id/ai/tags - Get all AI tags for walkthrough
router.get('/walkthroughs/:id/ai/tags', (req, res) => {
    try {
        const tags = ai_service_1.aiService.getTagsByWalkthrough(req.params.id);
        res.json({
            success: true,
            data: tags,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch AI tags', 500);
    }
});
// GET /api/scenes/:id/ai/tags - Get AI tags for scene
router.get('/scenes/:id/ai/tags', (req, res) => {
    try {
        const tags = ai_service_1.aiService.getTagsByScene(req.params.id);
        res.json({
            success: true,
            data: tags,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch AI tags', 500);
    }
});
// PUT /api/ai/tags/:tagId - Update AI tag
router.put('/ai/tags/:tagId', (req, res) => {
    try {
        const updated = ai_service_1.aiService.updateTag(req.params.tagId, req.body);
        if (!updated) {
            throw new error_1.AppError('AI tag not found', 404);
        }
        res.json({
            success: true,
            message: 'AI tag updated',
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to update AI tag', 500);
    }
});
// DELETE /api/ai/tags/:tagId - Delete AI tag
router.delete('/ai/tags/:tagId', (req, res) => {
    try {
        const deleted = ai_service_1.aiService.deleteTag(req.params.tagId);
        if (!deleted) {
            throw new error_1.AppError('AI tag not found', 404);
        }
        res.json({
            success: true,
            message: 'AI tag deleted',
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to delete AI tag', 500);
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map