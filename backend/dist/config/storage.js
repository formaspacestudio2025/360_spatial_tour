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
    // Convert absolute path to relative URL
    const relativePath = path_1.default.relative(STORAGE_BASE, filePath);
    return `/storage/${relativePath.replace(/\\/g, '/')}`;
}
//# sourceMappingURL=storage.js.map