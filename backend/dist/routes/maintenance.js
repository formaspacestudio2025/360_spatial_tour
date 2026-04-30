"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const maintenance_service_1 = require("../services/maintenance.service");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// GET /api/maintenance?asset_id=...
router.get('/', async (req, res) => {
    try {
        const { asset_id } = req.query;
        if (!asset_id)
            return res.status(400).json({ success: false, message: 'asset_id required' });
        const schedules = await (0, maintenance_service_1.getSchedulesByAsset)(asset_id);
        res.json({ success: true, data: schedules });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/maintenance
router.post('/', async (req, res) => {
    try {
        const { asset_id, frequency_days, next_due_date } = req.body;
        if (!asset_id || !frequency_days) {
            return res.status(400).json({ success: false, message: 'asset_id and frequency_days required' });
        }
        const schedule = await (0, maintenance_service_1.createSchedule)({ asset_id, frequency_days, next_due_date });
        res.status(201).json({ success: true, data: schedule });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
    try {
        const schedule = await (0, maintenance_service_1.getScheduleById)(req.params.id);
        if (!schedule)
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, data: schedule });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// PUT /api/maintenance/:id
router.put('/:id', async (req, res) => {
    try {
        const schedule = await (0, maintenance_service_1.updateSchedule)(req.params.id, req.body);
        if (!schedule)
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, data: schedule });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
    try {
        const ok = await (0, maintenance_service_1.deleteSchedule)(req.params.id);
        if (!ok)
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, message: 'Deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=maintenance.js.map