import { Router } from 'express';
import { hotspotService } from '../services/hotspot.service';
import { AppError } from '../middleware/error';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/scenes/:sceneId/hotspots - Get hotspots for a scene
router.get('/scenes/:sceneId/hotspots', (req, res) => {
  try {
    const hotspots = hotspotService.getByScene(req.params.sceneId);
    res.json({
      success: true,
      data: hotspots,
    });
  } catch (error) {
    throw new AppError('Failed to fetch hotspots', 500);
  }
});

// POST /api/scenes/:sceneId/hotspots - Create hotspot (editor+)
router.post('/scenes/:sceneId/hotspots', authenticate, requireRole('editor', 'manager', 'admin'), (req, res) => {
  try {
    const { to_scene_id, yaw, pitch, label } = req.body;

    if (!to_scene_id || yaw === undefined || pitch === undefined) {
      throw new AppError('to_scene_id, yaw, and pitch are required', 400);
    }

    const hotspot = hotspotService.create({
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create hotspot', 500);
  }
});

// PUT /api/hotspots/:id - Update hotspot (editor+)
router.put('/hotspots/:id', authenticate, requireRole('editor', 'manager', 'admin'), (req, res) => {
  try {
    const hotspot = hotspotService.update(req.params.id, req.body);

    if (!hotspot) {
      throw new AppError('Hotspot not found', 404);
    }

    res.json({
      success: true,
      data: hotspot,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update hotspot', 500);
  }
});

// DELETE /api/hotspots/:id - Delete hotspot (editor+)
router.delete('/hotspots/:id', authenticate, requireRole('editor', 'manager', 'admin'), (req, res) => {
  try {
    const deleted = hotspotService.delete(req.params.id);

    if (!deleted) {
      throw new AppError('Hotspot not found', 404);
    }

    res.json({
      success: true,
      message: 'Hotspot deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete hotspot', 500);
  }
});

export default router;
