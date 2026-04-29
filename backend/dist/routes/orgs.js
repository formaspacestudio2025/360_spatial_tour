"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const org_service_1 = require("../services/org.service");
const auth_1 = require("../middleware/auth");
// For simplicity, use authenticate only; fine-grained RBAC can be added later
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// GET /api/orgs - list all orgs
router.get('/', async (req, res) => {
    try {
        const orgs = await (0, org_service_1.getOrgs)();
        res.json({ success: true, data: orgs });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/orgs/:id - get single org
router.get('/:id', async (req, res) => {
    try {
        const org = await (0, org_service_1.getOrgById)(req.params.id);
        if (!org)
            return res.status(404).json({ success: false, message: 'Organization not found' });
        res.json({ success: true, data: org });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// POST /api/orgs - create org
router.post('/', async (req, res) => {
    try {
        const org = await (0, org_service_1.createOrg)(req.body);
        res.status(201).json({ success: true, data: org });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// PUT /api/orgs/:id - update org
router.put('/:id', async (req, res) => {
    try {
        const org = await (0, org_service_1.updateOrg)(req.params.id, req.body);
        if (!org)
            return res.status(404).json({ success: false, message: 'Organization not found' });
        res.json({ success: true, data: org });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// DELETE /api/orgs/:id - delete org
router.delete('/:id', async (req, res) => {
    try {
        const success = await (0, org_service_1.deleteOrg)(req.params.id);
        if (!success)
            return res.status(404).json({ success: false, message: 'Organization not found' });
        res.json({ success: true, message: 'Organization deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=orgs.js.map