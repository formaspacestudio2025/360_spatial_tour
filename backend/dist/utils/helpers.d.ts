/**
 * Generate unique ID
 */
export declare function generateId(): string;
/**
 * Get current timestamp
 */
export declare function getTimestamp(): string;
/**
 * Parse JSON safely
 */
export declare function parseJSON<T>(data: string | null, fallback: T): T;
/**
 * Sanitize file name
 */
export declare function sanitizeFileName(fileName: string): string;
/**
 * Format file size
 */
export declare function formatFileSize(bytes: number): string;
//# sourceMappingURL=helpers.d.ts.map