"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asset_service_1 = require("../services/asset.service");
const qrcode_service_1 = require("../services/qrcode.service");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// Get all assets with optional walkthrough_id filter
router.get('/', (0, rbac_1.requirePermission)('asset', 'read'), async (req, res) => {
    try {
        const { walkthrough_id, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const result = await (0, asset_service_1.getAssets)(walkthrough_id, pageNum, limitNum);
        res.json({ success: true, data: result.assets, total: result.total, page: result.page, limit: result.limit });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Get asset by ID
router.get('/:id', (0, rbac_1.requirePermission)('asset', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await (0, asset_service_1.getAssetById)(id);
        if (!asset) {
            return res.status(404).json({ success: false, message: 'Asset not found' });
        }
        res.json({ success: true, data: asset });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Create a new asset
router.post('/', (0, rbac_1.requirePermission)('asset', 'write'), async (req, res) => {
    try {
        const assetData = req.body;
        const asset = await (0, asset_service_1.createAsset)(assetData);
        res.status(201).json({ success: true, data: asset });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Update an asset
router.put('/:id', (0, rbac_1.requirePermission)('asset', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const assetData = req.body;
        const asset = await (0, asset_service_1.updateAsset)(id, assetData);
        if (!asset) {
            return res.status(404).json({ success: false, message: 'Asset not found' });
        }
        res.json({ success: true, data: asset });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Delete an asset
router.delete('/:id', (0, rbac_1.requirePermission)('asset', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const success = await (0, asset_service_1.deleteAsset)(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Asset not found' });
        }
        res.json({ success: true, message: 'Asset deleted' });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Map asset to scene with spatial coordinates
router.put('/:id/map-to-scene', (0, rbac_1.requirePermission)('asset', 'write'), async (req, res) => {
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
        const updatedAsset = await (0, asset_service_1.updateAssetSceneMapping)(id, {
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
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Get assets mapped to a specific scene
router.get('/scene/:scene_id/assets', (0, rbac_1.requirePermission)('asset', 'read'), async (req, res) => {
    try {
        const { scene_id } = req.params;
        const assets = await (0, asset_service_1.getAssetsByScene)(scene_id);
        res.json({ success: true, data: assets });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// Get QR code for asset (returns PNG)
router.get('/:id/qr', (0, rbac_1.requirePermission)('asset', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await (0, asset_service_1.getAssetById)(id);
        if (!asset) {
            return res.status(404).json({ success: false, message: 'Asset not found' });
        }
        const size = req.query.size ? parseInt(req.query.size) : 200;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const assetUrl = `${frontendUrl}/assets/${id}`;
        const buffer = await (0, qrcode_service_1.generateQRCodeBuffer)({ data: assetUrl, size });
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="asset_${id}_qr.png"`);
        res.send(buffer);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=assets.js.map