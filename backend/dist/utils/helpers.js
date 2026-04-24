"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.getTimestamp = getTimestamp;
exports.parseJSON = parseJSON;
exports.sanitizeFileName = sanitizeFileName;
exports.formatFileSize = formatFileSize;
const uuid_1 = require("uuid");
/**
 * Generate unique ID
 */
function generateId() {
    return (0, uuid_1.v4)();
}
/**
 * Get current timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}
/**
 * Parse JSON safely
 */
function parseJSON(data, fallback) {
    if (!data)
        return fallback;
    try {
        return JSON.parse(data);
    }
    catch {
        return fallback;
    }
}
/**
 * Sanitize file name
 */
function sanitizeFileName(fileName) {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
}
/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
//# sourceMappingURL=helpers.js.map