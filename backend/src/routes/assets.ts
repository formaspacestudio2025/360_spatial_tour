import express from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset } from '../services/asset.service';

const router = express.Router();

// Get all assets with optional walkthrough_id filter
router.get('/', async (req, res) => {
  try {
    const { walkthrough_id } = req.query;
    const assets = await getAssets(walkthrough_id as string | undefined);
    res.json({ success: true, data: assets });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

export default router;
