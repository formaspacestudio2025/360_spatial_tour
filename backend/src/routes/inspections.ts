import express from 'express';
import { createInspection, getInspections, getInspectionById, toggleInspectionItem, signOffInspection, scheduleInspectionForAsset, updateInspection, deleteInspection } from '../services/inspection.service';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = express.Router();
router.use(authenticate);

// GET /api/inspections - list inspections
router.get('/', requirePermission('inspection', 'read'), async (req, res) => {
  try {
    const { walkthrough_id } = req.query;
    const inspections = await getInspections(walkthrough_id as string | undefined);
    res.json({ success: true, data: inspections });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/inspections - create inspection
router.post('/', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const inspection = await createInspection(req.body);
    res.status(201).json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// GET /api/inspections/:id - get single inspection
router.get('/:id', requirePermission('inspection', 'read'), async (req, res) => {
  try {
    const inspection = await getInspectionById(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/inspections/:id/toggle/:itemId - toggle checklist item
router.put('/:id/toggle/:itemId', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const inspection = await toggleInspectionItem(req.params.id, req.params.itemId);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/inspections/:id/signoff - sign off inspection
router.post('/:id/signoff', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const inspection = await signOffInspection(req.params.id);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/inspections/schedule-for-asset - schedule inspection for asset
router.post('/schedule-for-asset', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const { asset_id, walkthrough_id, due_date, checklist } = req.body;
    if (!asset_id || !walkthrough_id || !due_date || !checklist) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const inspection = await scheduleInspectionForAsset({ asset_id, walkthrough_id, due_date, checklist });
    res.status(201).json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/inspections/:id - update inspection
router.put('/:id', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const inspection = await updateInspection(req.params.id, req.body);
    if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/inspections/:id - delete inspection
router.delete('/:id', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const success = await deleteInspection(req.params.id);
    if (!success) return res.status(404).json({ success: false, message: 'Inspection not found' });
    res.json({ success: true, message: 'Inspection deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
