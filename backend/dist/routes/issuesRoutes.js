"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const issue_service_1 = require("../services/issue.service");
const generateId_1 = require("../utils/generateId");
const storage_service_1 = require("../services/storage.service");
const storage_1 = require("../config/storage");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.use(auth_1.authenticate);
// Create a new issue
router.post('/', (0, rbac_1.requirePermission)('issue', 'write'), async (req, res) => {
    try {
        const issueData = req.body;
        const issue = await (0, issue_service_1.createIssue)(issueData);
        res.status(201).json({ success: true, data: issue });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Get all issues with optional filters
router.get('/', (0, rbac_1.requirePermission)('issue', 'read'), async (req, res) => {
    try {
        const { scene_id, walkthrough_id } = req.query;
        let issues = await (0, issue_service_1.getIssues)();
        if (scene_id) {
            issues = issues.filter(issue => issue.scene_id === scene_id);
        }
        if (walkthrough_id) {
            issues = issues.filter(issue => issue.walkthrough_id === walkthrough_id);
        }
        res.json({ success: true, data: issues });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Update an issue
router.put('/:id', (0, rbac_1.requirePermission)('issue', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const issueData = req.body;
        const issue = await (0, issue_service_1.updateIssue)(id, issueData);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.json({ success: true, data: issue });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Delete an issue
router.delete('/:id', (0, rbac_1.requirePermission)('issue', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const success = await (0, issue_service_1.deleteIssue)(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.json({ success: true, message: 'Issue deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Get issue by ID
router.get('/:id', (0, rbac_1.requirePermission)('issue', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        const issues = await (0, issue_service_1.getIssues)();
        const issue = issues.find(i => i.id === id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.json({ success: true, data: issue });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// CSV Export
router.get('/export/csv', async (req, res) => {
    try {
        const { walkthrough_id, status, priority, type } = req.query;
        let issues = await (0, issue_service_1.getIssues)();
        if (walkthrough_id)
            issues = issues.filter(i => i.walkthrough_id === walkthrough_id);
        if (status)
            issues = issues.filter(i => i.status === status);
        if (priority)
            issues = issues.filter(i => i.priority === priority);
        if (type)
            issues = issues.filter(i => i.type === type);
        const csvHeaders = [
            'ID', 'Title', 'Type', 'Severity', 'Priority', 'Status',
            'Assigned To', 'Due Date', 'Scene ID', 'Created At', 'Updated At', 'Description'
        ].join(',');
        const csvRows = issues.map(i => [
            i.id,
            `"${(i.title || '').replace(/"/g, '""')}"`,
            i.type,
            i.severity,
            i.priority || '',
            i.status,
            i.assigned_to || '',
            i.due_date || '',
            i.scene_id,
            i.created_at,
            i.updated_at,
            `"${(i.description || '').replace(/"/g, '""')}"`,
        ].join(','));
        const csv = [csvHeaders, ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="issues-export-${Date.now()}.csv"`);
        res.send(csv);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// ==================== COMMENTS ====================
// Get comments for an issue
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await (0, issue_service_1.getComments)(req.params.id);
        res.json({ success: true, data: comments });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Add a comment to an issue
router.post('/:id/comments', async (req, res) => {
    try {
        const comment = await (0, issue_service_1.addComment)(req.params.id, req.body);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Delete a comment
router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const success = await (0, issue_service_1.deleteComment)(req.params.id, req.params.commentId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        res.json({ success: true, message: 'Comment deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// ==================== ATTACHMENTS ====================
// Upload attachment to an issue
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { id } = req.params;
        const issues = await (0, issue_service_1.getIssues)();
        const issue = issues.find((i) => i.id === id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        // Save file to storage
        const filePath = await storage_service_1.storageService.saveFile(issue.walkthrough_id, req.file, 'issues');
        const fileUrl = (0, storage_1.getFileUrl)(filePath);
        const attachment = await (0, issue_service_1.addAttachment)(id, {
            id: (0, generateId_1.generateId)(),
            file_url: fileUrl,
            file_type: req.file.mimetype,
            created_at: new Date().toISOString(),
        });
        res.status(201).json({ success: true, data: attachment });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Get all attachments for an issue
router.get('/:id/attachments', async (req, res) => {
    try {
        const { id } = req.params;
        const attachments = await (0, issue_service_1.getAttachments)(id);
        res.json({ success: true, data: attachments });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Delete an attachment
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
    try {
        const { id, attachmentId } = req.params;
        const success = await (0, issue_service_1.deleteAttachment)(id, attachmentId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Attachment not found' });
        }
        res.json({ success: true, message: 'Attachment deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Resolve issue with proof image
router.post('/:id/resolution', (0, rbac_1.requirePermission)('issue', 'write'), upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }
        // Get the issue to fetch walkthrough_id
        const existing = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }
        const filePath = await storage_service_1.storageService.saveFile(existing.walkthrough_id, req.file, 'issues');
        const fileUrl = (0, storage_1.getFileUrl)(filePath);
        const updated = await (0, issue_service_1.resolveIssue)(id, fileUrl);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// ==================== SLA ESCALATION ====================
// POST /api/issues/sla/check - Run SLA escalation check
router.post('/sla/check', async (req, res) => {
    try {
        const results = await (0, issue_service_1.checkAndEscalateSLA)();
        res.json({ success: true, data: results });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/issues/sla/stats - Get SLA statistics
router.get('/sla/stats', async (req, res) => {
    try {
        const stats = await (0, issue_service_1.getSlaStats)();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=issuesRoutes.js.map