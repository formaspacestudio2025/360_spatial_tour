import db from '../config/database';
import { generateId } from '../utils/generateId';
import { Asset } from '../types/asset';

export async function createAsset(data: {
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  scene_id?: string;
  yaw?: number;
  pitch?: number;
  floor?: number;
  room?: string;
  status?: 'active' | 'maintenance' | 'retired';
  walkthrough_id?: string;
  org_id?: string;
  property_id?: string;
}): Promise<Asset> {
  const id = generateId();
  const now = new Date().toISOString();

  const sql = `INSERT INTO assets (id, name, type, brand, model, serial_number, scene_id, yaw, pitch, floor, room, status, walkthrough_id, org_id, property_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.prepare(sql).run(
    id,
    data.name,
    data.type,
    data.brand || null,
    data.model || null,
    data.serial_number || null,
    data.scene_id || null,
    data.yaw ?? null,
    data.pitch ?? null,
    data.floor ?? null,
    data.room || null,
    data.status || 'active',
    data.walkthrough_id || null,
    data.org_id || null,
    data.property_id || null,
    now,
    now
  );

  return {
    id,
    ...data,
    status: data.status || 'active',
    created_at: now,
    updated_at: now,
  } as Asset;
}

export async function getAssets(walkthrough_id?: string): Promise<Asset[]> {
  let sql = 'SELECT * FROM assets';
  const stmt = db.prepare(sql);
  let assets = await stmt.all();

  if (walkthrough_id) {
    assets = assets.filter((a: any) => a.walkthrough_id === walkthrough_id);
  }

  // Sort by created_at descending
  assets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return assets;
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const stmt = db.prepare('SELECT * FROM assets WHERE id = ?');
  return stmt.get(id) || null;
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<Asset | null> {
  const existing = await db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...data, updated_at: now };

  const sql = `UPDATE assets SET
                name = ?, type = ?, brand = ?, model = ?, serial_number = ?,
                scene_id = ?, yaw = ?, pitch = ?, floor = ?, room = ?,
                status = ?, walkthrough_id = ?, org_id = ?, property_id = ?, updated_at = ?
                WHERE id = ?`;

  await db.prepare(sql).run(
    updated.name,
    updated.type,
    updated.brand || null,
    updated.model || null,
    updated.serial_number || null,
    updated.scene_id || null,
    updated.yaw ?? null,
    updated.pitch ?? null,
    updated.floor ?? null,
    updated.room || null,
    updated.status,
    updated.walkthrough_id || null,
    updated.org_id || null,
    updated.property_id || null,
    now,
    id
  );

  return updated;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  return result.changes > 0;
}
