"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storagePaths = void 0;
exports.initializeStorage = initializeStorage;
exports.createWalkthroughStorage = createWalkthroughStorage;
exports.getFileUrl = getFileUrl;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Storage paths configuration
const STORAGE_BASE = path_1.default.join(__dirname, '../../storage');
exports.storagePaths = {
    base: STORAGE_BASE,
    walkthroughs: (walkthroughId) => path_1.default.join(STORAGE_BASE, 'walkthroughs', walkthroughId),
    scenes: (walkthroughId) => path_1.default.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'scenes'),
    thumbnails: (walkthroughId) => path_1.default.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'thumbnails'),
    exports: (walkthroughId) => path_1.default.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'exports'),
    issues: (walkthroughId) => path_1.default.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'issues'),
    documents: (assetId) => path_1.default.join(STORAGE_BASE, 'assets', assetId, 'documents'),
};
// Ensure storage directories exist
function initializeStorage() {
    const dirs = [
        STORAGE_BASE,
        path_1.default.join(STORAGE_BASE, 'walkthroughs'),
    ];
    dirs.forEach(dir => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
    console.log('✅ Storage initialized successfully');
}
// Create walkthrough-specific directories
function createWalkthroughStorage(walkthroughId) {
    const paths = [
        exports.storagePaths.walkthroughs(walkthroughId),
        exports.storagePaths.scenes(walkthroughId),
        exports.storagePaths.thumbnails(walkthroughId),
        exports.storagePaths.exports(walkthroughId),
    ];
    paths.forEach(dir => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
}
// Get file URL for frontend
function getFileUrl(filePath) {
    if (!filePath)
        return null;
    try {
        // Handle Windows paths on Unix systems
        let normalizedFilePath = filePath;
        // If path contains Windows drive letter (C:\), convert to Unix format
        if (filePath.match(/^[A-Za-z]:\\/)) {
            // Replace backslashes with forward slashes
            normalizedFilePath = filePath.replace(/\\/g, '/');
            // Remove drive letter and colon
            normalizedFilePath = normalizedFilePath.replace(/^[A-Za-z]:\//, '/');
        }
        else {
            // Normalize paths for Unix/Windows consistency
            normalizedFilePath = path_1.default.normalize(filePath).replace(/\\/g, '/');
        }
        const normalizedBase = path_1.default.normalize(STORAGE_BASE).replace(/\\/g, '/');
        // Check if file is within storage base
        if (!normalizedFilePath.startsWith(normalizedBase)) {
            console.warn('File path is not within storage base:', {
                filePath,
                normalizedFilePath,
                storageBase: normalizedBase,
            });
            // Try to extract the relative part from the path
            // Look for 'storage' in the path
            const storageIndex = normalizedFilePath.indexOf('/storage/');
            if (storageIndex >= 0) {
                const relativePath = normalizedFilePath.substring(storageIndex + '/storage/'.length);
                return `/storage/${relativePath}`;
            }
            return null;
        }
        // Convert absolute path to relative URL
        const relativePath = normalizedFilePath.substring(normalizedBase.length + 1);
        return `/storage/${relativePath}`;
    }
    catch (error) {
        console.error('Error getting file URL:', error);
        return null;
    }
}
//# sourceMappingURL=storage.js.map