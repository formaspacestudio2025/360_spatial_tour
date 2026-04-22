import { Router } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AppError } from '../middleware/error';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  try {
    const stats = dashboardService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    throw new AppError('Failed to fetch dashboard stats', 500);
  }
});

// GET /api/dashboard/activity
router.get('/activity', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = dashboardService.getRecentActivity(limit);
    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    throw new AppError('Failed to fetch activity feed', 500);
  }
});

// GET /api/dashboard/team
router.get('/team', (req, res) => {
  try {
    const team = dashboardService.getTeam();
    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    throw new AppError('Failed to fetch team members', 500);
  }
});

export default router;
