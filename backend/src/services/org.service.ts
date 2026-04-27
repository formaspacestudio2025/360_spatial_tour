import db from '../config/database';
import { generateId } from '../utils/generateId';
import { Org } from '../types/org';

/**
 * Organization Service - CRUD operations for organizations.
 */
export async function createOrg(data: { name: string }): Promise<Org> {
  const id = generateId();
  const now = new Date().toISOString();

  const sql = `INSERT INTO organizations (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`;
  await db.prepare(sql).run(id, data.name, now, now);

  return {
    id,
    name: data.name,
    created_at: now,
    updated_at: now,
  } as Org;
}

export async function getOrgs(): Promise<Org[]> {
  const stmt = db.prepare('SELECT * FROM organizations');
  return stmt.all();
}

export async function getOrgById(id: string): Promise<Org | null> {
  const stmt = db.prepare('SELECT * FROM organizations WHERE id = ?');
  return stmt.get(id) || null;
}

export async function updateOrg(id: string, data: Partial<Org>): Promise<Org | null> {
  const existing = await db.prepare('SELECT * FROM organizations WHERE id = ?').get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...data, updated_at: now };

  const sql = `UPDATE organizations SET name = ?, updated_at = ? WHERE id = ?`;
  await db.prepare(sql).run(updated.name, now, id);

  return updated as Org;
}

export async function deleteOrg(id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM organizations WHERE id = ?').run(id);
  return result.changes > 0;
}
