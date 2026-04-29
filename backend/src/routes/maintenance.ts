import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createSchedule,
  getSchedulesByAsset,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from '../services/maintenance.service';

const router = express.Router();
router.use(authenticate);

// GET /api/maintenance?asset_id=...
router.get('/', async (req, res) => {
  try {
    const { asset_id } = req.query;
    if (!asset_id) return res.status(400).json({ success: false, message: 'asset_id required' });
    const schedules = await getSchedulesByAsset(asset_id as string);
    res.json({ success: true, data: schedules });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/maintenance
router.post('/', async (req, res) => {
  try {
    const { asset_id, frequency_days, next_due_date } = req.body;
    if (!asset_id || !frequency_days) {
      return res.status(400).json({ success: false, message: 'asset_id and frequency_days required' });
    }
    const schedule = await createSchedule({ asset_id, frequency_days, next_due_date });
    res.status(201).json({ success: true, data: schedule });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
  try {
    const schedule = await getScheduleById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, data: schedule });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/maintenance/:id
router.put('/:id', async (req, res) => {
  try {
    const schedule = await updateSchedule(req.params.id, req.body);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, data: schedule });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteSchedule(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
