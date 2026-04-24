import fs from 'fs';
export declare class StorageService {
    /**
     * Save uploaded file to storage
     */
    saveFile(walkthroughId: string, file: Express.Multer.File, subfolder?: 'scenes' | 'thumbnails' | 'exports'): Promise<string>;
    /**
     * Generate thumbnail from 360 image
     */
    generateThumbnail(walkthroughId: string, imagePath: string): Promise<string>;
    /**
     * Delete file
     */
    deleteFile(filePath: string): boolean;
    /**
     * Get file stats
     */
    getFileStats(filePath: string): fs.Stats | null;
    /**
     * List files in directory
     */
    listFiles(directory: string): string[];
}
export declare const storageService: StorageService;
//# sourceMappingURL=storage.service.d.ts.map