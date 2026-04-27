import express from 'express';
import multer from 'multer';
import { createIssue, getIssues, updateIssue, deleteIssue, addComment, getComments, deleteComment, addAttachment, getAttachments, deleteAttachment, checkAndEscalateSLA, getSlaStats } from '../services/issue.service';
import { generateId } from '../utils/generateId';
import { storageService } from '../services/storage.service';
import { getFileUrl } from '../config/storage';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
router.use(authenticate);

// Create a new issue
router.post('/', requirePermission('issue','write'), async (req, res) => {
  try {
    const issueData = req.body;
    const issue = await createIssue(issueData);
    res.status(201).json({ success: true, data: issue });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get all issues with optional filters
router.get('/', requirePermission('issue','read'), async (req, res) => {
  try {
    const { scene_id, walkthrough_id } = req.query;
    let issues = await getIssues();
    if (scene_id) {
      issues = issues.filter(issue => issue.scene_id === scene_id);
    }
    if (walkthrough_id) {
      issues = issues.filter(issue => issue.walkthrough_id === walkthrough_id);
    }
    res.json({ success: true, data: issues });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Update an issue
router.put('/:id', requirePermission('issue','write'), async (req, res) => {
  try {
    const { id } = req.params;
    const issueData = req.body;
    const issue = await updateIssue(id, issueData);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.json({ success: true, data: issue });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Delete an issue
router.delete('/:id', requirePermission('issue','write'), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteIssue(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get issue by ID
router.get('/:id', requirePermission('issue','read'), async (req, res) => {
  try {
    const { id } = req.params;
    const issues = await getIssues();
    const issue = issues.find(i => i.id === id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.json({ success: true, data: issue });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// CSV Export
router.get('/export/csv', async (req, res) => {
  try {
    const { walkthrough_id, status, priority, type } = req.query;
    let issues = await getIssues();
    if (walkthrough_id) issues = issues.filter(i => i.walkthrough_id === walkthrough_id);
    if (status) issues = issues.filter(i => i.status === status);
    if (priority) issues = issues.filter(i => i.priority === priority);
    if (type) issues = issues.filter(i => i.type === type);

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
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// ==================== COMMENTS ====================

// Get comments for an issue
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await getComments(req.params.id);
    res.json({ success: true, data: comments });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Add a comment to an issue
router.post('/:id/comments', async (req, res) => {
  try {
    const comment = await addComment(req.params.id, req.body);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.status(201).json({ success: true, data: comment });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Delete a comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const success = await deleteComment(req.params.id, req.params.commentId);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
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
    const issues = await getIssues();
    const issue = issues.find((i: any) => i.id === id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Save file to storage
    const filePath = await storageService.saveFile(issue.walkthrough_id, req.file, 'issues');
    const fileUrl = getFileUrl(filePath);

    const attachment = await addAttachment(id, {
      id: generateId(),
      file_url: fileUrl,
      file_type: req.file.mimetype,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: attachment });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get all attachments for an issue
router.get('/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    const attachments = await getAttachments(id);
    res.json({ success: true, data: attachments });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Delete an attachment
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const success = await deleteAttachment(id, attachmentId);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }
    res.json({ success: true, message: 'Attachment deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// ==================== SLA ESCALATION ====================

// POST /api/issues/sla/check - Run SLA escalation check
router.post('/sla/check', async (req, res) => {
  try {
    const results = await checkAndEscalateSLA();
    res.json({ success: true, data: results });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// GET /api/issues/sla/stats - Get SLA statistics
router.get('/sla/stats', async (req, res) => {
  try {
    const stats = await getSlaStats();
    res.json({ success: true, data: stats });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;