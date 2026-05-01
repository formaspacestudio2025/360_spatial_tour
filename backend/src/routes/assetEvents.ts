import express from 'express';
import { authenticate } from '../middleware/auth';
import { getAssetTimeline, getDigitalTwinSummary, logAssetEvent } from '../services/assetEvent.service';
import { AssetEventType } from '../types/assetEvent';

const router = express.Router();
router.use(authenticate);

// Get asset timeline (paginated)
router.get('/:assetId/timeline', async (req: any, res) => {
  try {
    const { assetId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const event_type = req.query.event_type as AssetEventType | undefined;
    const start_date = req.query.start_date as string | undefined;
    const end_date = req.query.end_date as string | undefined;

    const result = await getAssetTimeline(assetId, { limit, offset, event_type, start_date, end_date });
    res.json({ success: true, data: result.events, total: result.total, limit, offset });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get digital twin summary
router.get('/:assetId/summary', async (req: any, res) => {
  try {
    const { assetId } = req.params;
    const summary = await getDigitalTwinSummary(assetId);
    res.json({ success: true, data: summary });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Log a new event (internal use or admin)
router.post('/:assetId/events', async (req: any, res) => {
  try {
    const { assetId } = req.params;
    const { event_type, title, description, metadata } = req.body;
    if (!event_type || !title) {
      return res.status(400).json({ success: false, message: 'event_type and title are required' });
    }
    const event = await logAssetEvent({
      asset_id: assetId,
      event_type,
      title,
      description: description || '',
      metadata,
      user_id: req.user?.id,
    });
    res.status(201).json({ success: true, data: event });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
