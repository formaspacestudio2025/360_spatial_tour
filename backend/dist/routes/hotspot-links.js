"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hotspot_links_service_1 = require("../services/hotspot-links.service");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const router = express_1.default.Router();
/**
 * GET /api/hotspot-links/:hotspotId
 * Get all links for a hotspot
 */
router.get('/hotspot-links/:hotspotId', auth_1.authenticate, async (req, res, next) => {
    try {
        const { hotspotId } = req.params;
        const links = hotspot_links_service_1.hotspotLinkService.getByHotspot(hotspotId);
        res.json({ data: links });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/hotspot-links/:hotspotId
 * Create a new link
 */
router.post('/hotspot-links/:hotspotId', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), async (req, res, next) => {
    try {
        const { hotspotId } = req.params;
        const { title, url, description, category, sort_order } = req.body;
        if (!title || !url) {
            throw new error_1.AppError('Title and URL are required', 400);
        }
        const link = hotspot_links_service_1.hotspotLinkService.create({
            hotspot_id: hotspotId,
            title,
            url,
            description,
            category,
            sort_order,
        });
        res.json({
            message: 'Link created successfully',
            data: link,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/hotspot-links/:id
 * Update a link
 */
router.put('/hotspot-links/:id', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const link = hotspot_links_service_1.hotspotLinkService.update(id, req.body);
        if (!link) {
            throw new error_1.AppError('Link not found', 404);
        }
        res.json({ data: link });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/hotspot-links/:id
 * Delete a link
 */
router.delete('/hotspot-links/:id', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = hotspot_links_service_1.hotspotLinkService.delete(id);
        if (!success) {
            throw new error_1.AppError('Link not found', 404);
        }
        res.json({ message: 'Link deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/hotspot-links/bulk-delete
 * Bulk delete links
 */
router.post('/hotspot-links/bulk-delete', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new error_1.AppError('Array of IDs required', 400);
        }
        const deleted = hotspot_links_service_1.hotspotLinkService.bulkDelete(ids);
        res.json({
            message: `Deleted ${deleted} link(s)`,
            data: { deleted },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/hotspot-links/:hotspotId/reorder
 * Reorder links
 */
router.post('/hotspot-links/:hotspotId/reorder', auth_1.authenticate, (0, auth_1.requireRole)('editor', 'manager', 'admin'), async (req, res, next) => {
    try {
        const { hotspotId } = req.params;
        const { linkIds } = req.body;
        if (!linkIds || !Array.isArray(linkIds)) {
            throw new error_1.AppError('Array of link IDs required', 400);
        }
        hotspot_links_service_1.hotspotLinkService.reorder(hotspotId, linkIds);
        const links = hotspot_links_service_1.hotspotLinkService.getByHotspot(hotspotId);
        res.json({
            message: 'Links reordered successfully',
            data: links,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=hotspot-links.js.map