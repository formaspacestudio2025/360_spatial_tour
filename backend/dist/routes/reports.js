"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_service_1 = require("../services/report.service");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// POST /api/reports/issue-pdf - Generate PDF for an issue
router.post('/issue-pdf', (0, rbac_1.requirePermission)('report', 'write'), async (req, res) => {
    try {
        const { issueId } = req.body;
        if (!issueId) {
            return res.status(400).json({ success: false, message: 'issueId is required' });
        }
        const pdfBuffer = await (0, report_service_1.generateIssueReport)(issueId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="issue-report.pdf"');
        res.send(pdfBuffer);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/reports/inspection-pdf/:id - Generate PDF for an inspection
router.get('/inspection-pdf/:id', (0, rbac_1.requirePermission)('report', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        const pdfBuffer = await (0, report_service_1.generateInspectionReport)(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="inspection-report.pdf"');
        res.send(pdfBuffer);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map