import db from './config/database';

db.prepare(`
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    walkthrough_id TEXT NOT NULL,
    scene_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('damage', 'safety', 'maintenance', 'compliance', 'custom')) NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`).run();

export default db;
