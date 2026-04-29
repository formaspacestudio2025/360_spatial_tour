import path from 'path';
import fs from 'fs';

// Storage paths configuration
const STORAGE_BASE = path.join(__dirname, '../../storage');

export const storagePaths = {
  base: STORAGE_BASE,
  walkthroughs: (walkthroughId: string) => 
    path.join(STORAGE_BASE, 'walkthroughs', walkthroughId),
  scenes: (walkthroughId: string) =>
    path.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'scenes'),
  thumbnails: (walkthroughId: string) =>
    path.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'thumbnails'),
  exports: (walkthroughId: string) =>
    path.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'exports'),
  issues: (walkthroughId: string) =>
    path.join(STORAGE_BASE, 'walkthroughs', walkthroughId, 'issues'),
  documents: (assetId: string) =>
    path.join(STORAGE_BASE, 'assets', assetId, 'documents'),
};

// Ensure storage directories exist
export function initializeStorage() {
  const dirs = [
    STORAGE_BASE,
    path.join(STORAGE_BASE, 'walkthroughs'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('✅ Storage initialized successfully');
}

// Create walkthrough-specific directories
export function createWalkthroughStorage(walkthroughId: string) {
  const paths = [
    storagePaths.walkthroughs(walkthroughId),
    storagePaths.scenes(walkthroughId),
    storagePaths.thumbnails(walkthroughId),
    storagePaths.exports(walkthroughId),
  ];
  
  paths.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Get file URL for frontend
export function getFileUrl(filePath: string): string | null {
  if (!filePath) return null;

  try {
    // Handle Windows paths on Unix systems
    let normalizedFilePath = filePath;

    // If path contains Windows drive letter (C:\), convert to Unix format
    if (filePath.match(/^[A-Za-z]:\\/)) {
      // Replace backslashes with forward slashes
      normalizedFilePath = filePath.replace(/\\/g, '/');
      // Remove drive letter and colon
      normalizedFilePath = normalizedFilePath.replace(/^[A-Za-z]:\//, '/');
    } else {
      // Normalize paths for Unix/Windows consistency
      normalizedFilePath = path.normalize(filePath).replace(/\\/g, '/');
    }

    const normalizedBase = path.normalize(STORAGE_BASE).replace(/\\/g, '/');

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
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
}
