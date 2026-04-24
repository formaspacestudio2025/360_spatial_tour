"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_service_1 = require("../services/dashboard.service");
const error_1 = require("../middleware/error");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
    try {
        const stats = dashboard_service_1.dashboardService.getStats();
        res.json({
            success: true,
            data: stats,
        });
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
        res.json({
            success: true,
            data: activity,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch activity feed', 500);
    }
});
// GET /api/dashboard/team
router.get('/team', (req, res) => {
    try {
        const team = dashboard_service_1.dashboardService.getTeam();
        res.json({
            success: true,
            data: team,
        });
    }
    catch (error) {
        throw new error_1.AppError('Failed to fetch team members', 500);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map