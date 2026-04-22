import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { hotspotMediaService } from '../services/hotspot-media.service';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { generateId } from '../utils/helpers';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'hotspot-media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${generateId()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for flexibility
    cb(null, true);
  },
});

// Determine file type from mime type
function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * GET /api/hotspot-media/:hotspotId
 * Get all media for a hotspot
 */
router.get(
  '/hotspot-media/:hotspotId',
  authenticate,
  async (req: Request, res: Response, next) => {
    try {
      const { hotspotId } = req.params;
      const media = hotspotMediaService.getByHotspot(hotspotId);
      res.json({ data: media });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/hotspot-media/:hotspotId/upload
 * Upload one or more files to a hotspot
 */
router.post(
  '/hotspot-media/:hotspotId/upload',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  (req, res, next) => {
    // Custom error handler for multer
    upload.array('files', 20)(req, res, (err) => {
      if (err) {
        console.error('[HotspotMedia] Multer error:', err);
        return next(err);
      }
      next();
    });
  },
  async (req: Request, res: Response, next: any) => {
    try {
      console.log('\n[HotspotMedia] ========== UPLOAD REQUEST ==========');
      console.log('[HotspotMedia] hotspotId:', req.params.hotspotId);
      console.log('[HotspotMedia] Content-Type:', req.headers['content-type']);
      console.log('[HotspotMedia] req.files:', req.files);
      console.log('[HotspotMedia] req.body:', req.body);
      console.log('[HotspotMedia] User:', (req as any).user);
      
      const { hotspotId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        console.error('[HotspotMedia] ❌ No files received!');
        console.error('[HotspotMedia] This usually means:');
        console.error('[HotspotMedia] 1. Frontend not sending FormData correctly');
        console.error('[HotspotMedia] 2. Multer not configured properly');
        console.error('[HotspotMedia] 3. Content-Type header issue');
        throw new AppError('No files uploaded. Please select files and try again.', 400);
      }

      console.log(`[HotspotMedia] ✅ Processing ${files.length} file(s)`);
      const userId = (req as any).user?.id;
      console.log('[HotspotMedia] userId:', userId);
      
      const uploadedMedia = [];

      for (const file of files) {
        const mediaData = {
          hotspot_id: hotspotId,
          file_name: file.originalname,
          file_type: getFileType(file.mimetype),
          file_size: file.size,
          file_path: file.path,
          title: path.parse(file.originalname).name,
          uploaded_by: userId,
        };

        const media = hotspotMediaService.create(mediaData);
        uploadedMedia.push(media);
      }

      res.json({
        message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
        data: uploadedMedia,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/hotspot-media/:id
 * Update media metadata
 */
router.put(
  '/hotspot-media/:id',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params;
      const { title, description, sort_order } = req.body;

      const media = hotspotMediaService.update(id, {
        title,
        description,
        sort_order,
      });

      if (!media) {
        throw new AppError('Media not found', 404);
      }

      res.json({ data: media });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/hotspot-media/:id
 * Delete a media file
 */
router.delete(
  '/hotspot-media/:id',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params;
      const success = hotspotMediaService.delete(id);

      if (!success) {
        throw new AppError('Media not found', 404);
      }

      res.json({ message: 'Media deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/hotspot-media/bulk-delete
 * Delete multiple media files
 */
router.post(
  '/hotspot-media/bulk-delete',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('Array of IDs required', 400);
      }

      const deleted = hotspotMediaService.bulkDelete(ids);
      res.json({
        message: `Deleted ${deleted} file(s)`,
        data: { deleted },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/hotspot-media/:hotspotId/reorder
 * Reorder media files
 */
router.post(
  '/hotspot-media/:hotspotId/reorder',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  async (req: Request, res: Response, next) => {
    try {
      const { hotspotId } = req.params;
      const { mediaIds } = req.body;

      if (!mediaIds || !Array.isArray(mediaIds)) {
        throw new AppError('Array of media IDs required', 400);
      }

      hotspotMediaService.reorder(hotspotId, mediaIds);
      const media = hotspotMediaService.getByHotspot(hotspotId);

      res.json({
        message: 'Media reordered successfully',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
