import express from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate, assignTemplateToAsset } from '../services/checklist.service';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = express.Router();
router.use(authenticate);

// GET /api/checklists - list templates
router.get('/', requirePermission('inspection', 'read'), async (req, res) => {
  try {
    const { asset_type } = req.query;
    const templates = await getTemplates(asset_type as string | undefined);
    res.json({ success: true, data: templates });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/checklists - create template
router.post('/', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const { name, description, asset_type, items } = req.body;
    if (!name || !items) {
      return res.status(400).json({ success: false, message: 'name and items required' });
    }
    const template = await createTemplate({ name, description, asset_type, items });
    res.status(201).json({ success: true, data: template });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// GET /api/checklists/:id - get single template
router.get('/:id', requirePermission('inspection', 'read'), async (req, res) => {
  try {
    const template = await getTemplateById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/checklists/:id - update template
router.put('/:id', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const template = await updateTemplate(req.params.id, req.body);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/checklists/:id - delete template
router.delete('/:id', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const ok = await deleteTemplate(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/checklists/:id/assign-to-asset - assign template to asset
router.post('/:id/assign-to-asset', requirePermission('inspection', 'write'), async (req, res) => {
  try {
    const { asset_id, walkthrough_id, due_date } = req.body;
    if (!asset_id || !walkthrough_id) {
      return res.status(400).json({ success: false, message: 'asset_id and walkthrough_id required' });
    }
    const inspection = await assignTemplateToAsset(req.params.id, asset_id, walkthrough_id, due_date);
    res.status(201).json({ success: true, data: inspection });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
