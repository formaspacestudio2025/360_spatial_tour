import db from '../config/database';import { generateId } from '../utils/generateId';

interface Issue {
  id: string;
  walkthrough_id: string;
  scene_id: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function createIssue(data: {
  walkthrough_id: string;
  scene_id: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
}): Promise<Issue> {
  const id = generateId();
  const now = new Date().toISOString();
  const sql = `INSERT INTO issues (id, walkthrough_id, scene_id, type, severity, status, title, description, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)`;
  await db.prepare(sql).run(id, data.walkthrough_id, data.scene_id, data.type, data.severity, data.title, data.description || '', now, now);
  return { id, ...data, status: 'open', created_at: now, updated_at: now };
}

export async function getIssues(): Promise<Issue[]> {
  const sql = 'SELECT * FROM issues ORDER BY created_at DESC';
  const stmt = db.prepare(sql);
  const issues = await stmt.all();
  return issues;
}
