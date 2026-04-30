"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inspection_service_1 = require("../services/inspection.service");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// GET /api/inspections - list inspections
router.get('/', (0, rbac_1.requirePermission)('inspection', 'read'), async (req, res) => {
    try {
        const { walkthrough_id } = req.query;
        const inspections = await (0, inspection_service_1.getInspections)(walkthrough_id);
        res.json({ success: true, data: inspections });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/inspections - create inspection
router.post('/', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const inspection = await (0, inspection_service_1.createInspection)(req.body);
        res.status(201).json({ success: true, data: inspection });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/inspections/:id - get single inspection
router.get('/:id', (0, rbac_1.requirePermission)('inspection', 'read'), async (req, res) => {
    try {
        const inspection = await (0, inspection_service_1.getInspectionById)(req.params.id);
        if (!inspection)
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        res.json({ success: true, data: inspection });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// PUT /api/inspections/:id/toggle/:itemId - toggle checklist item
router.put('/:id/toggle/:itemId', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const inspection = await (0, inspection_service_1.toggleInspectionItem)(req.params.id, req.params.itemId);
        if (!inspection)
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        res.json({ success: true, data: inspection });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/inspections/:id/signoff - sign off inspection
router.post('/:id/signoff', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const inspection = await (0, inspection_service_1.signOffInspection)(req.params.id);
        if (!inspection)
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        res.json({ success: true, data: inspection });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/inspections/schedule-for-asset - schedule inspection for asset
router.post('/schedule-for-asset', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const { asset_id, walkthrough_id, due_date, checklist } = req.body;
        if (!asset_id || !walkthrough_id || !due_date || !checklist) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const inspection = await (0, inspection_service_1.scheduleInspectionForAsset)({ asset_id, walkthrough_id, due_date, checklist });
        res.status(201).json({ success: true, data: inspection });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=inspections.js.map