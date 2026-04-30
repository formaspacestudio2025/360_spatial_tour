import express from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, updateAssetSceneMapping, getAssetsByScene, addAssetDocument, getAssetDocuments, deleteAssetDocument, getAssetContext, generateInventoryReport, createWorkOrder, updateWorkOrder, getRecentInspections } from '../services/asset.service';
import { generateQRCodeBuffer } from '../services/qrcode.service';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storagePaths } from '../config/storage';

const router = express.Router();
router.use(authenticate);

// Get all assets with optional filters
router.get('/', requirePermission('asset','read'), async (req, res) => {
  try {
    const { walkthrough_id, page = '1', limit = '10', type, status, health_min, q } = req.query as any;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const filters: any = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (health_min) filters.health_min = parseInt(health_min, 10);
    if (q) filters.q = q;
    const result = await getAssets(
      walkthrough_id as string | undefined,
      pageNum,
      limitNum,
      Object.keys(filters).length > 0 ? filters : undefined
    );
    res.json({ success: true, data: result.assets, total: result.total, page: result.page, limit: result.limit });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Inventory report with depreciation
router.get('/inventory-report', requirePermission('asset', 'read'), async (req, res) => {
  console.log('HIT /inventory-report route');
  try {
    const { walkthrough_id } = req.query as any;
    const report = await generateInventoryReport(walkthrough_id as string | undefined);
    res.json({ success: true, data: report });
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

// GET /api/assets/:id/context
router.get('/:id/context', requirePermission('asset','read'), async (req, res) => {
  try {
    const { id } = req.params;
    const context = await getAssetContext(id);
    if (!context) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, data: context });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// POST /api/assets/:id/work-orders
router.post('/:id/work-orders', requirePermission('asset', 'write'), async (req, res) => {
  try {
    const { id } = req.params;
    const wo = await createWorkOrder({ ...req.body, asset_id: id });
    res.status(201).json({ success: true, data: wo });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/assets/work-orders/:woId
router.put('/work-orders/:woId', requirePermission('asset', 'write'), async (req, res) => {
  try {
    const { woId } = req.params;
    const wo = await updateWorkOrder(woId, req.body);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    res.json({ success: true, data: wo });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Bulk import assets from CSV
const csv = require('csv-parser');
const multerCSV = multer({ storage: multer.memoryStorage() });

router.post('/import', requirePermission('asset', 'write'), multerCSV.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }

    const results: any[] = [];
    const errors: string[] = [];

    // Parse CSV from buffer
    const stream = require('stream');
    const readable = new stream.Readable();
    readable.push(req.file.buffer);
    readable.push(null);

    await new Promise<void>((resolve) => {
      readable
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
        .on('end', () => resolve());
    });

    // Validate and create assets
    const created: any[] = [];
    for (const [idx, row] of results.entries()) {
      try {
        if (!row.name || !row.type) {
          errors.push(`Row ${idx + 2}: Missing required fields (name, type)`);
          continue;
        }
        const asset = await createAsset({
          name: row.name,
          type: row.type,
          brand: row.brand || undefined,
          model: row.model || undefined,
          serial_number: row.serial_number || undefined,
          status: row.status || 'active',
          walkthrough_id: row.walkthrough_id || undefined,
          purchase_date: row.purchase_date || undefined,
          warranty_date: row.warranty_date || undefined,
        });
        created.push(asset);
      } catch (e: any) {
        errors.push(`Row ${idx + 2}: ${e.message}`);
      }
    }

    res.json({
      success: true,
      data: { created: created.length, errors, rows: results.length },
    });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Export assets to CSV
router.get('/export/csv', requirePermission('asset', 'read'), async (req, res) => {
  try {
    const { walkthrough_id } = req.query as any;
    const result = await getAssets(walkthrough_id as string | undefined, 1, 999999);
    const assets = result.assets;

    if (assets.length === 0) {
      return res.status(404).json({ success: false, message: 'No assets to export' });
    }

    // Build CSV
    const headers = ['id', 'name', 'type', 'brand', 'model', 'serial_number', 'status', 'scene_id', 'floor', 'room', 'health_score', 'purchase_date', 'warranty_date', 'created_at'];
    const rows = assets.map(a => [
      a.id,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      a.type,
      `"${(a.brand || '').replace(/"/g, '""')}"`,
      `"${(a.model || '').replace(/"/g, '""')}"`,
      `"${(a.serial_number || '').replace(/"/g, '""')}"`,
      a.status,
      a.scene_id || '',
      a.floor || '',
      `"${(a.room || '').replace(/"/g, '""')}"`,
      a.health_score || '',
      a.purchase_date || '',
      a.warranty_date || '',
      a.created_at,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="assets_export.csv"');
    res.send(csvContent);
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

// GET /api/assets/recent-inspections
router.get('/recent-inspections', requirePermission('asset', 'read'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const inspections = await getRecentInspections(limit);
    res.json({ success: true, data: inspections });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
