"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walkthrough_service_1 = require("../services/walkthrough.service");
const error_1 = require("../middleware/error");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// GET /api/walkthroughs - Get all walkthroughs (public)
router.get('/', auth_1.authenticate, (0, rbac_1.requirePermission)('walkthrough', 'read'), (req, res) => {
    try {
        const query = {
            search: req.query.search,
            status: req.query.status,
            client: req.query.client,
        };
        const walkthroughs = walkthrough_service_1.walkthroughService.getAll(query);
        res.json({
            success: true,
            data: walkthroughs,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch walkthroughs', 500);
    }
});
// GET /api/walkthroughs/clients - Get unique clients (must be before /:id)
router.get('/clients', (req, res) => {
    try {
        const clients = walkthrough_service_1.walkthroughService.getClients();
        res.json({
            success: true,
            data: clients,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch clients', 500);
    }
});
// GET /api/walkthroughs/:id - Get walkthrough by ID
router.get('/:id', (req, res) => {
    try {
        const walkthrough = walkthrough_service_1.walkthroughService.getWithStats(req.params.id);
        if (!walkthrough) {
            throw new error_1.AppError('Walkthrough not found', 404);
        }
        res.json({
            success: true,
            data: walkthrough,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to fetch walkthrough', 500);
    }
});
// POST /api/walkthroughs - Create walkthrough (editor+)
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), (req, res) => {
    try {
        const data = req.body;
        if (!data.name) {
            throw new error_1.AppError('Walkthrough name is required', 400);
        }
        const walkthrough = walkthrough_service_1.walkthroughService.create(data);
        res.status(201).json({
            success: true,
            data: walkthrough,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to create walkthrough', 500);
    }
});
// PUT /api/walkthroughs/:id - Update walkthrough (editor+)
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), (req, res) => {
    try {
        const data = req.body;
        const walkthrough = walkthrough_service_1.walkthroughService.update(req.params.id, data);
        if (!walkthrough) {
            throw new error_1.AppError('Walkthrough not found', 404);
        }
        res.json({
            success: true,
            data: walkthrough,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to update walkthrough', 500);
    }
});
// DELETE /api/walkthroughs/:id - Delete walkthrough (manager+)
router.delete('/:id', auth_1.authenticate, (0, auth_1.requireRole)('manager', 'admin'), (req, res) => {
    try {
        const deleted = walkthrough_service_1.walkthroughService.delete(req.params.id);
        if (!deleted) {
            throw new error_1.AppError('Walkthrough not found', 404);
        }
        res.json({
            success: true,
            message: 'Walkthrough deleted successfully',
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError('Failed to delete walkthrough', 500);
    }
});
exports.default = router;
//# sourceMappingURL=walkthroughs.js.map