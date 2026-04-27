import express from 'express';
import { createOrg, getOrgs, getOrgById, updateOrg, deleteOrg } from '../services/org.service';
import { authenticate } from '../middleware/auth';
// For simplicity, use authenticate only; fine-grained RBAC can be added later

const router = express.Router();
router.use(authenticate);

// GET /api/orgs - list all orgs
router.get('/', async (req, res) => {
  try {
    const orgs = await getOrgs();
    res.json({ success: true, data: orgs });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// GET /api/orgs/:id - get single org
router.get('/:id', async (req, res) => {
  try {
    const org = await getOrgById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.json({ success: true, data: org });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/orgs - create org
router.post('/', async (req, res) => {
  try {
    const org = await createOrg(req.body);
    res.status(201).json({ success: true, data: org });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/orgs/:id - update org
router.put('/:id', async (req, res) => {
  try {
    const org = await updateOrg(req.params.id, req.body);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.json({ success: true, data: org });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/orgs/:id - delete org
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteOrg(req.params.id);
    if (!success) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.json({ success: true, message: 'Organization deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
