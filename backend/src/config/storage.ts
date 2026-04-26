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
export function getFileUrl(filePath: string): string {
  // Convert absolute path to relative URL
  const relativePath = path.relative(STORAGE_BASE, filePath);
  return `/storage/${relativePath.replace(/\\/g, '/')}`;
}
