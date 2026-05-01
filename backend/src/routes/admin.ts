import express from 'express';
import { authenticate } from '../middleware/auth';
import { UserRole } from '../types/user';
import fs from 'fs';
import path from 'path';
import { getDatabaseAdapter } from '../config/database.adapter';

const router = express.Router();
router.use(authenticate);

const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * POST /api/admin/backup
 * Creates a timestamped backup of the database
 */
router.post('/backup', async (req: any, res) => {
  if (!req.user || (req.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const adapter = getDatabaseAdapter();
    const data = adapter.read();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.json`);

    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        filename: path.basename(backupFile),
        path: backupFile,
        size: fs.statSync(backupFile).size,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Backup failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/restore
 * Restores database from a backup file
 * Body: { filename: string } or { backupData: object }
 */
router.post('/restore', async (req: any, res) => {
  if (!req.user || (req.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const { filename, backupData } = req.body;

    let dataToRestore: any;

    if (backupData) {
      // Restore from provided data
      dataToRestore = backupData;
    } else if (filename) {
      // Restore from backup file
      const backupFile = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(backupFile)) {
        return res.status(404).json({ success: false, message: 'Backup file not found' });
      }
      dataToRestore = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide either filename or backupData',
      });
    }

    // Validate backup data structure
    const requiredTables = ['users', 'walkthroughs', 'scenes', 'issues', 'assets'];
    for (const table of requiredTables) {
      if (!dataToRestore[table]) {
        dataToRestore[table] = [];
      }
    }

    // Write restored data
    const adapter = getDatabaseAdapter();
    adapter.write(dataToRestore);

    res.json({
      success: true,
      message: 'Database restored successfully',
      data: {
        restored_at: new Date().toISOString(),
        tables: Object.keys(dataToRestore).length,
      },
    });
  } catch (error: any) {
    console.error('Restore failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/backups
 * List all available backups
 */
router.get('/backups', async (req: any, res) => {
  if (!req.user || (req.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          filename: f,
          size: stats.size,
          created_at: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ success: true, data: files });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
