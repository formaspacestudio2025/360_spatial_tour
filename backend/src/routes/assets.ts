import express from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, updateAssetSceneMapping, getAssetsByScene } from '../services/asset.service';
import { generateQRCodeBuffer } from '../services/qrcode.service';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = express.Router();
router.use(authenticate);

// Get all assets with optional walkthrough_id filter
router.get('/', requirePermission('asset','read'), async (req, res) => {
  try {
    const { walkthrough_id, page = '1', limit = '10' } = req.query as any;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const result = await getAssets(walkthrough_id as string | undefined, pageNum, limitNum);
    res.json({ success: true, data: result.assets, total: result.total, page: result.page, limit: result.limit });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get asset by ID
router.get('/:id', requirePermission('asset','read'), async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await getAssetById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, data: asset });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Create a new asset
router.post('/', requirePermission('asset','write'), async (req, res) => {
  try {
    const assetData = req.body;
    const asset = await createAsset(assetData);
    res.status(201).json({ success: true, data: asset });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Update an asset
router.put('/:id', requirePermission('asset','write'), async (req, res) => {
  try {
    const { id } = req.params;
    const assetData = req.body;
    const asset = await updateAsset(id, assetData);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, data: asset });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Delete an asset
router.delete('/:id', requirePermission('asset','write'), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteAsset(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, message: 'Asset deleted' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Map asset to scene with spatial coordinates
router.put('/:id/map-to-scene', requirePermission('asset','write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { scene_id, yaw, pitch, floor, room } = req.body;

    // Validate spatial coordinates
    if (yaw !== undefined && (yaw < 0 || yaw > 360)) {
      return res.status(400).json({ success: false, message: 'Yaw must be between 0 and 360 degrees' });
    }

    if (pitch !== undefined && (pitch < -90 || pitch > 90)) {
      return res.status(400).json({ success: false, message: 'Pitch must be between -90 and 90 degrees' });
    }

    const updatedAsset = await updateAssetSceneMapping(id, {
      scene_id,
      yaw,
      pitch,
      floor,
      room
    });

    if (!updatedAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, data: updatedAsset });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get assets mapped to a specific scene
router.get('/scene/:scene_id/assets', requirePermission('asset','read'), async (req, res) => {
  try {
    const { scene_id } = req.params;
    const assets = await getAssetsByScene(scene_id);
    res.json({ success: true, data: assets });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get QR code for asset (returns PNG)
router.get('/:id/qr', requirePermission('asset','read'), async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await getAssetById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    const size = req.query.size ? parseInt(req.query.size as string) : 200;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const assetUrl = `${frontendUrl}/assets/${id}`;
    const buffer = await generateQRCodeBuffer({ data: assetUrl, size });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="asset_${id}_qr.png"`);
    res.send(buffer);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
