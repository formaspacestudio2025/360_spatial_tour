import express, { Request, Response } from 'express';
import { hotspotLinkService } from '../services/hotspot-links.service';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = express.Router();

/**
 * GET /api/hotspot-links/:hotspotId
 * Get all links for a hotspot
 */
router.get(
  '/hotspot-links/:hotspotId',
  authenticate,
  async (req: Request, res: Response, next) => {
    try {
      const { hotspotId } = req.params;
      const links = hotspotLinkService.getByHotspot(hotspotId);
      res.json({ data: links });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/hotspot-links/:hotspotId
 * Create a new link
 */
router.post(
  '/hotspot-links/:hotspotId',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { hotspotId } = req.params;
      const { title, url, description, category, sort_order } = req.body;

      if (!title || !url) {
        throw new AppError('Title and URL are required', 400);
      }

      const link = hotspotLinkService.create({
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/hotspot-links/:id
 * Update a link
 */
router.put(
  '/hotspot-links/:id',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params;
      const link = hotspotLinkService.update(id, req.body);

      if (!link) {
        throw new AppError('Link not found', 404);
      }

      res.json({ data: link });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/hotspot-links/:id
 * Delete a link
 */
router.delete(
  '/hotspot-links/:id',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params;
      const success = hotspotLinkService.delete(id);

      if (!success) {
        throw new AppError('Link not found', 404);
      }

      res.json({ message: 'Link deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/hotspot-links/bulk-delete
 * Bulk delete links
 */
router.post(
  '/hotspot-links/bulk-delete',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('Array of IDs required', 400);
      }

      const deleted = hotspotLinkService.bulkDelete(ids);
      res.json({
        message: `Deleted ${deleted} link(s)`,
        data: { deleted },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/hotspot-links/:hotspotId/reorder
 * Reorder links
 */
router.post(
  '/hotspot-links/:hotspotId/reorder',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { hotspotId } = req.params;
      const { linkIds } = req.body;

      if (!linkIds || !Array.isArray(linkIds)) {
        throw new AppError('Array of link IDs required', 400);
      }

      hotspotLinkService.reorder(hotspotId, linkIds);
      const links = hotspotLinkService.getByHotspot(hotspotId);

      res.json({
        message: 'Links reordered successfully',
        data: links,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
