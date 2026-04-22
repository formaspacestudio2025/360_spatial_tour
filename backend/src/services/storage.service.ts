import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { storagePaths } from '../config/storage';

export class StorageService {
  /**
   * Save uploaded file to storage
   */
  async saveFile(
    walkthroughId: string,
    file: Express.Multer.File,
    subfolder: 'scenes' | 'thumbnails' | 'exports' = 'scenes'
  ): Promise<string> {
    const folder = storagePaths[subfolder](walkthroughId);
    
    // Ensure folder exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(folder, filename);

    // Move file
    await fs.promises.rename(file.path, filePath);

    return filePath;
  }

  /**
   * Generate thumbnail from 360 image
   */
  async generateThumbnail(
    walkthroughId: string,
    imagePath: string
  ): Promise<string> {
    const thumbnailPath = path.join(
      storagePaths.thumbnails(walkthroughId),
      `thumb-${path.basename(imagePath)}`
    );

    // Ensure thumbnail directory exists
    const thumbDir = storagePaths.thumbnails(walkthroughId);
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    // Create thumbnail (resize to 512x256 for equirectangular)
    await sharp(imagePath)
      .resize(512, 256)
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }

  /**
   * Delete file
   */
  deleteFile(filePath: string): boolean {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * Get file stats
   */
  getFileStats(filePath: string): fs.Stats | null {
    try {
      return fs.statSync(filePath);
    } catch {
      return null;
    }
  }

  /**
   * List files in directory
   */
  listFiles(directory: string): string[] {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory);
  }
}

export const storageService = new StorageService();
