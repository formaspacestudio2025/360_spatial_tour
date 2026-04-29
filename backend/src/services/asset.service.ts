import db from '../config/database';
import { generateId } from '../utils/generateId';
import { Asset } from '../types/asset';

export interface AssetLifecycle {
  ageYears: number | null;
  ageMonths: number | null;
  warrantyExpired: boolean;
  warrantyDaysRemaining: number | null;
  warrantyStatus: 'active' | 'expiring_soon' | 'expired' | 'not_set';
}

export function calculateLifecycle(asset: Asset): AssetLifecycle {
  const now = new Date();
  let ageYears: number | null = null;
  let ageMonths: number | null = null;
  let warrantyExpired = false;
  let warrantyDaysRemaining: number | null = null;
  let warrantyStatus: 'active' | 'expiring_soon' | 'expired' | 'not_set' = 'not_set';

  if (asset.purchase_date) {
    const purchase = new Date(asset.purchase_date);
    const diffTime = now.getTime() - purchase.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    ageYears = Math.floor(diffDays / 365);
    ageMonths = Math.floor((diffDays % 365) / 30);
  }

  if (asset.warranty_date) {
    const warranty = new Date(asset.warranty_date);
    const diffTime = warranty.getTime() - now.getTime();
    warrantyDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    warrantyExpired = warrantyDaysRemaining < 0;

    if (warrantyExpired) {
      warrantyStatus = 'expired';
    } else if (warrantyDaysRemaining <= 30) {
      warrantyStatus = 'expiring_soon';
    } else {
      warrantyStatus = 'active';
    }
  }

  return {
    ageYears,
    ageMonths,
    warrantyExpired,
    warrantyDaysRemaining,
    warrantyStatus,
  };
}

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
  purchase_date?: string;
  warranty_date?: string;
}): Promise<Asset> {
  const id = generateId();
  const now = new Date().toISOString();

  const sql = `INSERT INTO assets (id, name, type, brand, model, serial_number, scene_id, yaw, pitch, floor, room, status, walkthrough_id, org_id, property_id, purchase_date, warranty_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    data.purchase_date || null,
    data.warranty_date || null,
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

export async function getAssets(walkthrough_id?: string, page: number = 1, limit: number = 10): Promise<{assets: Asset[]; total: number; page: number; limit: number}> {
  // Base query – fetch all assets (will filter in memory for simplicity)
  const stmt = db.prepare('SELECT * FROM assets');
  let assets: Asset[] = await stmt.all();

  // Optional walkthrough filter
  if (walkthrough_id) {
    assets = assets.filter((a: any) => a.walkthrough_id === walkthrough_id);
  }

  // Sort newest first
  assets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = assets.length;
  const start = (page - 1) * limit;
  const paged = assets.slice(start, start + limit);

  return { assets: paged, total, page, limit };
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
                status = ?, walkthrough_id = ?, org_id = ?, property_id = ?, purchase_date = ?, warranty_date = ?, updated_at = ?
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
    updated.purchase_date || null,
    updated.warranty_date || null,
    now,
    id
  );

  return updated;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  return result.changes > 0;
}

export async function updateAssetSceneMapping(id: string, mapping: {
  scene_id?: string;
  yaw?: number;
  pitch?: number;
  floor?: number;
  room?: string;
}): Promise<Asset | null> {
  const existing = await db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!existing) return null;

  // Ensure org_id and property_id from existing asset are preserved
  const mappingData = {
    scene_id: mapping.scene_id || existing.scene_id,
    yaw: mapping.yaw,
    pitch: mapping.pitch,
    floor: mapping.floor,
    room: mapping.room || existing.room,
    org_id: existing.org_id,
    property_id: existing.property_id
  };

  const now = new Date().toISOString();
  const updated = { ...existing, ...mappingData, updated_at: now };

  const sql = `UPDATE assets SET
                scene_id = ?, yaw = ?, pitch = ?, floor = ?, room = ?, updated_at = ?
                WHERE id = ?`;

  await db.prepare(sql).run(
    updated.scene_id,
    updated.yaw,
    updated.pitch,
    updated.floor,
    updated.room,
    now,
    id
  );

  return updated;
}

export async function getAssetsByScene(scene_id: string): Promise<Asset[]> {
  const stmt = db.prepare('SELECT * FROM assets WHERE scene_id = ?');
  const assets = await stmt.all(scene_id);

  // Sort by created_at descending
  assets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return assets;
}
