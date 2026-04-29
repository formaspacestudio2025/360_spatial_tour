"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_service_1 = require("../services/dashboard.service");
const error_1 = require("../middleware/error");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/stats', (req, res) => {
    try {
        const { startDate, endDate, walkthroughId } = req.query;
        const stats = dashboard_service_1.dashboardService.getStats(startDate, endDate, walkthroughId);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch dashboard stats', 500);
    }
});
// GET /api/dashboard/activity
router.get('/activity', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activity = dashboard_service_1.dashboardService.getRecentActivity(limit);
        res.json({ success: true, data: activity });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch activity feed', 500);
    }
});
// GET /api/dashboard/team
router.get('/team', (req, res) => {
    try {
        const team = dashboard_service_1.dashboardService.getTeam();
        res.json({ success: true, data: team });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch team members', 500);
    }
});
// GET /api/dashboard/charts/issues-by-status?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issues-by-status', (req, res) => {
    try {
        const { startDate, endDate, walkthroughId } = req.query;
        res.json({ success: true, data: dashboard_service_1.dashboardService.getIssuesByStatus(startDate, endDate, walkthroughId) });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch issues by status', 500);
    }
});
// GET /api/dashboard/charts/issues-by-type?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issues-by-type', (req, res) => {
    try {
        const { startDate, endDate, walkthroughId } = req.query;
        res.json({ success: true, data: dashboard_service_1.dashboardService.getIssuesByType(startDate, endDate, walkthroughId) });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch issues by type', 500);
    }
});
// GET /api/dashboard/charts/issues-by-priority?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issues-by-priority', (req, res) => {
    try {
        const { startDate, endDate, walkthroughId } = req.query;
        res.json({ success: true, data: dashboard_service_1.dashboardService.getIssuesByPriority(startDate, endDate, walkthroughId) });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch issues by priority', 500);
    }
});
// GET /api/dashboard/charts/issue-trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&walkthroughId=xxx
router.get('/charts/issue-trend', (req, res) => {
    try {
        const { startDate, endDate, walkthroughId } = req.query;
        res.json({ success: true, data: dashboard_service_1.dashboardService.getIssueTrend(startDate, endDate, walkthroughId) });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch issue trend', 500);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map