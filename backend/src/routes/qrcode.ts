import express from 'express';
import { generateQRCode, generateQRCodeBuffer } from '../services/qrcode.service';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// GET /api/qrcode?data=XXX - returns QR code as data URL
router.get('/', async (req, res) => {
  try {
    const { data, size } = req.query;
    if (!data) {
      return res.status(400).json({ success: false, message: 'data query parameter is required' });
    }

    const qrDataUrl = await generateQRCode({
      data: data as string,
      size: size ? parseInt(size as string) : 200,
    });

    res.json({ success: true, data: qrDataUrl });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
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

    const buffer = await generateQRCodeBuffer({
      data: data as string,
      size: size ? parseInt(size as string) : 200,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
    res.send(buffer);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
