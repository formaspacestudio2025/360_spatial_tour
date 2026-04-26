import { Router } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AppError } from '../middleware/error';

const router = Router();

// GET /api/dashboard/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/stats', (req, res) => {
  try {
    const { startDate, endDate, walkthroughId } = req.query;
    const stats = dashboardService.getStats(
      startDate as string | undefined,
      endDate as string | undefined,
      walkthroughId as string | undefined
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    throw new AppError('Failed to fetch dashboard stats', 500);
  }
});

// GET /api/dashboard/activity
router.get('/activity', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = dashboardService.getRecentActivity(limit);
    res.json({ success: true, data: activity });
  } catch (error) {
    throw new AppError('Failed to fetch activity feed', 500);
  }
});

// GET /api/dashboard/team
router.get('/team', (req, res) => {
  try {
    const team = dashboardService.getTeam();
    res.json({ success: true, data: team });
  } catch (error) {
    throw new AppError('Failed to fetch team members', 500);
  }
});

// GET /api/dashboard/charts/issues-by-status?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issues-by-status', (req, res) => {
  try {
    const { startDate, endDate, walkthroughId } = req.query;
    res.json({ success: true, data: dashboardService.getIssuesByStatus(
      startDate as string | undefined,
      endDate as string | undefined,
      walkthroughId as string | undefined
    ) });
  } catch (error) {
    throw new AppError('Failed to fetch issues by status', 500);
  }
});

// GET /api/dashboard/charts/issues-by-type?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issues-by-type', (req, res) => {
  try {
    const { startDate, endDate, walkthroughId } = req.query;
    res.json({ success: true, data: dashboardService.getIssuesByType(
      startDate as string | undefined,
      endDate as string | undefined,
      walkthroughId as string | undefined
    ) });
  } catch (error) {
    throw new AppError('Failed to fetch issues by type', 500);
  }
});

// GET /api/dashboard/charts/issues-by-priority?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issues-by-priority', (req, res) => {
  try {
    const { startDate, endDate, walkthroughId } = req.query;
    res.json({ success: true, data: dashboardService.getIssuesByPriority(
      startDate as string | undefined,
      endDate as string | undefined,
      walkthroughId as string | undefined
    ) });
  } catch (error) {
    throw new AppError('Failed to fetch issues by priority', 500);
  }
});

// GET /api/dashboard/charts/issue-trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issue-trend', (req, res) => {
  try {
    const { startDate, endDate, walkthroughId } = req.query;
    res.json({ success: true, data: dashboardService.getIssueTrend(
      startDate as string | undefined,
      endDate as string | undefined,
      walkthroughId as string | undefined
    ) });
  } catch (error) {
    throw new AppError('Failed to fetch issue trend', 500);
  }
});

export default router;
