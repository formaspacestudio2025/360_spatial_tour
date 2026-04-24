"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage_1 = require("../config/storage");
class StorageService {
    /**
     * Save uploaded file to storage
     */
    async saveFile(walkthroughId, file, subfolder = 'scenes') {
        const folder = storage_1.storagePaths[subfolder](walkthroughId);
        // Ensure folder exists
        if (!fs_1.default.existsSync(folder)) {
            fs_1.default.mkdirSync(folder, { recursive: true });
        }
        // Generate unique filename
        const ext = path_1.default.extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filePath = path_1.default.join(folder, filename);
        // Move file
        await fs_1.default.promises.rename(file.path, filePath);
        return filePath;
    }
    /**
     * Generate thumbnail from 360 image
     */
    async generateThumbnail(walkthroughId, imagePath) {
        const thumbnailPath = path_1.default.join(storage_1.storagePaths.thumbnails(walkthroughId), `thumb-${path_1.default.basename(imagePath)}`);
        // Ensure thumbnail directory exists
        const thumbDir = storage_1.storagePaths.thumbnails(walkthroughId);
        if (!fs_1.default.existsSync(thumbDir)) {
            fs_1.default.mkdirSync(thumbDir, { recursive: true });
        }
        // Create thumbnail (resize to 512x256 for equirectangular)
        await (0, sharp_1.default)(imagePath)
            .resize(512, 256)
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        return thumbnailPath;
    }
    /**
     * Delete file
     */
    deleteFile(filePath) {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    /**
     * Get file stats
     */
    getFileStats(filePath) {
        try {
            return fs_1.default.statSync(filePath);
        }
        catch {
            return null;
        }
    }
    /**
     * List files in directory
     */
    listFiles(directory) {
        if (!fs_1.default.existsSync(directory))
            return [];
        return fs_1.default.readdirSync(directory);
    }
}
exports.StorageService = StorageService;
exports.storageService = new StorageService();
//# sourceMappingURL=storage.service.js.map