import express from 'express';
import { generateIssueReport, generateInspectionReport } from '../services/report.service';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = express.Router();
router.use(authenticate);

// POST /api/reports/issue-pdf - Generate PDF for an issue
router.post('/issue-pdf', requirePermission('report', 'write'), async (req, res) => {
  try {
    const { issueId } = req.body;
    if (!issueId) {
      return res.status(400).json({ success: false, message: 'issueId is required' });
    }

    const pdfBuffer = await generateIssueReport(issueId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="issue-report.pdf"');
    res.send(pdfBuffer);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/inspection-pdf/:id - Generate PDF for an inspection
router.get('/inspection-pdf/:id', requirePermission('report', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await generateInspectionReport(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="inspection-report.pdf"');
    res.send(pdfBuffer);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
