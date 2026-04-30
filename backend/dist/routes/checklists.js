"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checklist_service_1 = require("../services/checklist.service");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// GET /api/checklists - list templates
router.get('/', (0, rbac_1.requirePermission)('inspection', 'read'), async (req, res) => {
    try {
        const { asset_type } = req.query;
        const templates = await (0, checklist_service_1.getTemplates)(asset_type);
        res.json({ success: true, data: templates });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/checklists - create template
router.post('/', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const { name, description, asset_type, items } = req.body;
        if (!name || !items) {
            return res.status(400).json({ success: false, message: 'name and items required' });
        }
        const template = await (0, checklist_service_1.createTemplate)({ name, description, asset_type, items });
        res.status(201).json({ success: true, data: template });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/checklists/:id - get single template
router.get('/:id', (0, rbac_1.requirePermission)('inspection', 'read'), async (req, res) => {
    try {
        const template = await (0, checklist_service_1.getTemplateById)(req.params.id);
        if (!template)
            return res.status(404).json({ success: false, message: 'Template not found' });
        res.json({ success: true, data: template });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// PUT /api/checklists/:id - update template
router.put('/:id', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const template = await (0, checklist_service_1.updateTemplate)(req.params.id, req.body);
        if (!template)
            return res.status(404).json({ success: false, message: 'Template not found' });
        res.json({ success: true, data: template });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// DELETE /api/checklists/:id - delete template
router.delete('/:id', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const ok = await (0, checklist_service_1.deleteTemplate)(req.params.id);
        if (!ok)
            return res.status(404).json({ success: false, message: 'Template not found' });
        res.json({ success: true, message: 'Deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/checklists/:id/assign-to-asset - assign template to asset
router.post('/:id/assign-to-asset', (0, rbac_1.requirePermission)('inspection', 'write'), async (req, res) => {
    try {
        const { asset_id, walkthrough_id, due_date } = req.body;
        if (!asset_id || !walkthrough_id) {
            return res.status(400).json({ success: false, message: 'asset_id and walkthrough_id required' });
        }
        const inspection = await (0, checklist_service_1.assignTemplateToAsset)(req.params.id, asset_id, walkthrough_id, due_date);
        res.status(201).json({ success: true, data: inspection });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=checklists.js.map