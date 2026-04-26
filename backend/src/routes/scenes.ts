import { Router } from 'express';
import { sceneService, CreateSceneData } from '../services/scene.service';
import { storageService } from '../services/storage.service';
import { getFileUrl } from '../config/storage';
import { upload } from '../middleware/upload';
import { AppError } from '../middleware/error';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/walkthroughs/:walkthroughId/scenes - Get all scenes
router.get('/walkthroughs/:walkthroughId/scenes', (req, res) => {
  try {
    const scenes = sceneService.getByWalkthrough(req.params.walkthroughId);
    
    // Add image URLs to each scene
    const scenesWithUrls = scenes.map(scene => {
      const imageUrl = getFileUrl(scene.image_path) || scene.image_path;
      const thumbnailUrl = scene.thumbnail_path ? getFileUrl(scene.thumbnail_path) : null;
      const nadirImageUrl = scene.nadir_image_path ? getFileUrl(scene.nadir_image_path) : null;
      console.log(`Scene ${scene.id}: image_path=${scene.image_path}, image_url=${imageUrl}, nadir=${scene.nadir_image_path}`);
      return {
        ...scene,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        nadir_image_url: nadirImageUrl,
      };
    });
    
    res.json({
      success: true,
      data: scenesWithUrls,
    });
  } catch (error) {
    throw new AppError('Failed to fetch scenes', 500);
  }
});

// POST /api/walkthroughs/:walkthroughId/scenes - Upload scene(s) (editor+)
router.post(
  '/walkthroughs/:walkthroughId/scenes',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  upload.array('images', 20),
  async (req, res, next) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        throw new AppError('No image files uploaded', 400);
      }

      const walkthroughId = req.params.walkthroughId;
      const files = req.files as Express.Multer.File[];
      const roomNames = req.body.room_names ? JSON.parse(req.body.room_names) : {};
      const floors = req.body.floors ? JSON.parse(req.body.floors) : {};
      const notesList = req.body.notes ? JSON.parse(req.body.notes) : {};

      const createdScenes = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Save file to permanent storage
        const imagePath = await storageService.saveFile(walkthroughId, file, 'scenes');

        // Generate thumbnail
        let thumbnailPath: string | undefined;
        try {
          thumbnailPath = await storageService.generateThumbnail(walkthroughId, imagePath);
        } catch (error) {
          console.warn('Thumbnail generation failed:', error);
        }

        // Create scene in database
        const sceneData: CreateSceneData = {
          walkthrough_id: walkthroughId,
          image_path: imagePath,
          thumbnail_path: thumbnailPath,
          room_name: roomNames[i] || undefined,
          floor: floors[i] ? parseInt(floors[i]) : 1,
          notes: notesList[i] || undefined,
        };

        const scene = sceneService.create(sceneData);
        createdScenes.push({
          ...scene,
          image_url: getFileUrl(imagePath),
          thumbnail_url: thumbnailPath ? getFileUrl(thumbnailPath) : null,
        });
      }

      res.status(201).json({
        success: true,
        data: createdScenes,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/scenes/:id - Get scene by ID
router.get('/scenes/:id', (req, res) => {
  try {
    const scene = sceneService.getWithStats(req.params.id);

    if (!scene) {
      throw new AppError('Scene not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...scene,
        image_url: getFileUrl(scene.image_path),
        thumbnail_url: scene.thumbnail_path ? getFileUrl(scene.thumbnail_path) : null,
        nadir_image_url: scene.nadir_image_path ? getFileUrl(scene.nadir_image_path) : null,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch scene', 500);
  }
});

// PUT /api/scenes/:id - Update scene
router.put('/scenes/:id', (req, res) => {
  try {
    const scene = sceneService.update(req.params.id, req.body);

    if (!scene) {
      throw new AppError('Scene not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...scene,
        image_url: getFileUrl(scene.image_path),
        thumbnail_url: scene.thumbnail_path ? getFileUrl(scene.thumbnail_path) : null,
        nadir_image_url: scene.nadir_image_path ? getFileUrl(scene.nadir_image_path) : null,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update scene', 500);
  }
});

// DELETE /api/scenes/:id - Delete scene (manager+)
router.delete('/scenes/:id', authenticate, requireRole('manager', 'admin'), (req, res) => {
  try {
    const deleted = sceneService.delete(req.params.id);

    if (!deleted) {
      throw new AppError('Scene not found', 404);
    }

    res.json({
      success: true,
      message: 'Scene deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete scene', 500);
  }
});

// POST /api/scenes/:id/upload-nadir - Upload nadir image (editor+)
router.post(
  '/scenes/:id/upload-nadir',
  authenticate,
  requireRole('editor', 'manager', 'admin'),
  upload.single('nadir'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('No nadir image uploaded', 400);
      }

      const sceneId = req.params.id;
      const nadirPath = req.file.path;

      // Update scene with nadir image path
      const scene = sceneService.update(sceneId, {
        nadir_image_path: nadirPath,
      });

      if (!scene) {
        throw new AppError('Scene not found', 404);
      }

      res.json({
        success: true,
        data: {
          nadir_image_path: nadirPath,
          nadir_image_url: getFileUrl(nadirPath),
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upload nadir image', 500);
    }
  }
);

export default router;
