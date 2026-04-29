import express from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, updateAssetSceneMapping, getAssetsByScene, addAssetDocument, getAssetDocuments, deleteAssetDocument } from '../services/asset.service';
import { generateQRCodeBuffer } from '../services/qrcode.service';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storagePaths } from '../config/storage';

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

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const assetId = req.params.id;
    const dir = storagePaths.documents(assetId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// Upload document for asset
router.post('/:id/documents', requirePermission('asset','write'), documentUpload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const doc = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploaded_at: new Date().toISOString(),
      mimetype: req.file.mimetype,
    };

    const result = await addAssetDocument(id, doc);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get all documents for asset
router.get('/:id/documents', requirePermission('asset','read'), async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await getAssetDocuments(id);
    res.json({ success: true, data: documents });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Download document
router.get('/:id/documents/:filename', requirePermission('asset','read'), async (req, res) => {
  try {
    const { id, filename } = req.params;
    const documents = await getAssetDocuments(id);
    const doc = documents.find((d: any) => d.filename === filename);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.download(doc.path, doc.originalname);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Delete document
router.delete('/:id/documents/:filename', requirePermission('asset','write'), async (req, res) => {
  try {
    const { id, filename } = req.params;
    const success = await deleteAssetDocument(id, filename);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document deleted' });
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
