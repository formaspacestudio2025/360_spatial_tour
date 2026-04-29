"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qrcode_service_1 = require("../services/qrcode.service");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// GET /api/qrcode?data=XXX - returns QR code as data URL
router.get('/', async (req, res) => {
    try {
        const { data, size } = req.query;
        if (!data) {
            return res.status(400).json({ success: false, message: 'data query parameter is required' });
        }
        const qrDataUrl = await (0, qrcode_service_1.generateQRCode)({
            data: data,
            size: size ? parseInt(size) : 200,
        });
        res.json({ success: true, data: qrDataUrl });
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
// GET /api/qrcode/buffer?data=XXX - returns QR code as PNG buffer
router.get('/buffer', async (req, res) => {
    try {
        const { data, size } = req.query;
        if (!data) {
            return res.status(400).json({ success: false, message: 'data query parameter is required' });
        }
        const buffer = await (0, qrcode_service_1.generateQRCodeBuffer)({
            data: data,
            size: size ? parseInt(size) : 200,
        });
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
        res.send(buffer);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=qrcode.js.map