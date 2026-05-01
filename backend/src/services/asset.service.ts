import db from '../config/database';
import { generateId } from '../utils/generateId';
import { Asset, AssetDocument, ComplianceTag } from '../types/asset';
import { logAssetEvent } from './assetEvent.service';

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

// Calculate straight-line depreciation for an asset
export interface DepreciationInfo {
  purchasePrice: number;
  salvageValue: number;
  usefulLifeYears: number;
  currentAgeYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  depreciationRate: number; // percentage per year
}

export function calculateDepreciation(asset: Asset): DepreciationInfo | null {
  if (!asset.purchase_date || !asset.purchase_price) {
    return null; // Cannot calculate without purchase date and price
  }

  const purchasePrice = asset.purchase_price;
  const salvageValue = asset.salvage_value || 0;
  const usefulLifeYears = asset.useful_life_years || 10; // default 10 years
  const depreciationRate = 100 / usefulLifeYears; // percentage per year

  // Calculate current age
  const purchase = new Date(asset.purchase_date);
  const now = new Date();
  const diffTime = now.getTime() - purchase.getTime();
  const currentAgeYears = diffTime / (1000 * 60 * 60 * 24 * 365); // decimal years

  // Straight-line depreciation
  const totalDepreciable = purchasePrice - salvageValue;
  const annualDepreciation = totalDepreciable / usefulLifeYears;
  const accumulatedDepreciation = Math.min(annualDepreciation * currentAgeYears, totalDepreciable);
  const currentBookValue = purchasePrice - accumulatedDepreciation;

  return {
    purchasePrice,
    salvageValue,
    usefulLifeYears,
    currentAgeYears: Math.floor(currentAgeYears),
    annualDepreciation,
    accumulatedDepreciation,
    currentBookValue: Math.max(currentBookValue, salvageValue),
    depreciationRate,
  };
}

// Generate annual inventory report with depreciation calculations
export async function generateInventoryReport(walkthrough_id?: string): Promise<{
  reportDate: string;
  totalAssets: number;
  totalOriginalValue: number;
  totalCurrentValue: number;
  totalAccumulatedDepreciation: number;
  assets: Array<{
    asset: Asset;
    depreciation: DepreciationInfo | null;
  }>;
}> {
  const result = await getAssets(walkthrough_id || undefined, 1, 999999);
  const assets = result.assets;
  const reportDate = new Date().toISOString();

  let totalOriginalValue = 0;
  let totalCurrentValue = 0;
  let totalAccumulatedDepreciation = 0;

  const assetReports = assets.map(asset => {
    const depreciation = calculateDepreciation(asset);
    if (depreciation) {
      totalOriginalValue += depreciation.purchasePrice;
      totalCurrentValue += depreciation.currentBookValue;
      totalAccumulatedDepreciation += depreciation.accumulatedDepreciation;
    }
    return { asset, depreciation };
  });

  return {
    reportDate,
    totalAssets: assets.length,
    totalOriginalValue,
    totalCurrentValue,
    totalAccumulatedDepreciation,
    assets: assetReports,
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
  compliance?: ComplianceTag[];
}): Promise<Asset> {
  const id = generateId();
  const now = new Date().toISOString();

  const sql = `INSERT INTO assets (id, name, type, brand, model, serial_number, scene_id, yaw, pitch, floor, room, status, walkthrough_id, org_id, property_id, purchase_date, warranty_date, compliance, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    data.compliance ? JSON.stringify(data.compliance) : null,
    now,
    now
  );

  // Log creation event
  try {
    await logAssetEvent({
      asset_id: id,
      event_type: 'created',
      title: `Asset Created: ${data.name}`,
      description: `Asset ${data.name} was added to the system.`,
      metadata: { status: data.status || 'active', type: data.type },
    });
  } catch (e) { console.error('Failed to log asset creation event:', e); }

  return {
    id,
    ...data,
    status: data.status || 'active',
    created_at: now,
    updated_at: now,
  } as Asset;
}

export async function getAssets(
  walkthrough_id?: string,
  page: number = 1,
  limit: number = 10,
  filters?: {
    type?: string;
    status?: string;
    health_min?: number;
    q?: string; // search query
  }
): Promise<{assets: Asset[]; total: number; page: number; limit: number}> {
  // Base query – fetch all assets (will filter in memory for simplicity)
  const stmt = db.prepare('SELECT * FROM assets');
  let assets: Asset[] = await stmt.all();

  // Optional walkthrough filter
  if (walkthrough_id) {
    assets = assets.filter((a: any) => a.walkthrough_id === walkthrough_id);
  }

  // Filter by type
  if (filters?.type) {
    assets = assets.filter((a: any) => a.type === filters.type);
  }

  // Filter by status
  if (filters?.status) {
    assets = assets.filter((a: any) => a.status === filters.status);
  }

  // Calculate health scores for all assets (for listing and filtering)
  for (const asset of assets) {
    asset.health_score = await calculateHealthScore(asset);
  }

  // Filter by minimum health score
  if (filters?.health_min !== undefined) {
    assets = assets.filter((a: any) => (a.health_score || 0) >= filters.health_min!);
  }

  // Search query (name, brand, model, serial_number)
  if (filters?.q) {
    const query = filters.q.toLowerCase();
    assets = assets.filter((a: any) => {
      const searchText = [a.name, a.brand, a.model, a.serial_number].filter(Boolean).join(' ').toLowerCase();
      return searchText.includes(query);
    });
  }

  // Sort newest first
  assets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = assets.length;
  const start = (page - 1) * limit;
  const paged = assets.slice(start, start + limit);

  return { assets: paged, total, page, limit };
}

// Get asset statistics for dashboard
export async function getAssetStats(): Promise<{
  total: number;
  byHealth: { excellent: number; good: number; fair: number; poor: number };
  warrantyExpiringSoon: number;
  overdueInspections: number;
}> {
  const stmt = db.prepare('SELECT * FROM assets');
  const assets: Asset[] = await stmt.all();
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);

  let excellent = 0, good = 0, fair = 0, poor = 0;
  let warrantyExpiringSoon = 0;

  for (const asset of assets) {
    const score = await calculateHealthScore(asset);
    if (score >= 80) excellent++;
    else if (score >= 60) good++;
    else if (score >= 40) fair++;
    else poor++;
    if (asset.warranty_date) {
      const warranty = new Date(asset.warranty_date);
      if (warranty <= thirtyDaysFromNow && warranty >= now) warrantyExpiringSoon++;
    }
  }

  // Count overdue inspections (due_date passed)
  const inspStmt = db.prepare('SELECT * FROM inspections');
  const inspections: any[] = inspStmt.all() || [];
  const overdueInspections = inspections.filter((i: any) => i.due_date && new Date(i.due_date) < now).length;

  return {
    total: assets.length,
    byHealth: { excellent, good, fair, poor },
    warrantyExpiringSoon,
    overdueInspections,
  };
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const stmt = db.prepare('SELECT * FROM assets WHERE id = ?');
  const asset = stmt.get(id) || null;
  if (asset) {
    asset.health_score = await calculateHealthScore(asset);
    // Parse compliance JSON if stored as string
    if (asset.compliance && typeof asset.compliance === 'string') {
      try { asset.compliance = JSON.parse(asset.compliance); } catch {}
    }
    // Parse transition_history JSON if stored as string
    if (asset.transition_history && typeof asset.transition_history === 'string') {
      try { asset.transition_history = JSON.parse(asset.transition_history); } catch {}
    }
  }
  return asset;
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<Asset | null> {
  const existing = await db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...data, updated_at: now };

  const sql = `UPDATE assets SET
                name = ?, type = ?, brand = ?, model = ?, serial_number = ?,
                scene_id = ?, yaw = ?, pitch = ?, floor = ?, room = ?,
                status = ?, walkthrough_id = ?, org_id = ?, property_id = ?, purchase_date = ?, warranty_date = ?, compliance = ?, updated_at = ?
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
    updated.compliance ? JSON.stringify(updated.compliance) : null,
    now,
    id
  );

  return updated;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  return result.changes > 0;
}

export async function addAssetDocument(id: string, doc: AssetDocument): Promise<Asset | null> {
  const asset = await getAssetById(id);
  if (!asset) return null;

  const documents = asset.documents || [];
  documents.push(doc);

  await db.prepare('UPDATE assets SET documents = ?, updated_at = ? WHERE id = ?').run(
    JSON.stringify(documents),
    new Date().toISOString(),
    id
  );

  return { ...asset, documents };
}

export async function getAssetDocuments(id: string): Promise<AssetDocument[]> {
  const asset = await getAssetById(id);
  if (!asset) return [];
  return asset.documents || [];
}

export async function deleteAssetDocument(id: string, filename: string): Promise<boolean> {
  const asset = await getAssetById(id);
  if (!asset || !asset.documents) return false;

  const documents = asset.documents.filter((d: AssetDocument) => d.filename !== filename);

  await db.prepare('UPDATE assets SET documents = ?, updated_at = ? WHERE id = ?').run(
    JSON.stringify(documents),
    new Date().toISOString(),
    id
  );

  return true;
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

export async function calculateHealthScore(asset: Asset): Promise<number> {
  let score = 100;

  // Factor 1: Warranty status
  if (asset.warranty_date) {
    const warranty = new Date(asset.warranty_date);
    const now = new Date();
    if (warranty < now) {
      score -= 30; // Expired warranty
    } else {
      const diffTime = warranty.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 30) {
        score -= 15; // Expiring soon
      }
    }
  }

  // Factor 2: Age (older = lower score)
  if (asset.purchase_date) {
    const purchase = new Date(asset.purchase_date);
    const now = new Date();
    const diffTime = now.getTime() - purchase.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const ageYears = Math.floor(diffDays / 365);
    score -= Math.min(ageYears * 1, 20); // -1 per year, max -20
  }

  // Factor 3: Status
  if (asset.status === 'commissioning') {
    score -= 5; // brand new, slight uncertainty
  } else if (asset.status === 'active') {
    // no penalty
  } else if (asset.status === 'maintenance') {
    score -= 10;
  } else if (asset.status === 'repair') {
    score -= 25; // more severe than maintenance
  } else if (asset.status === 'decommissioned') {
    score -= 70;
  } else if (asset.status === 'disposed') {
    score -= 90;
  }

  // Factor 4: Open issues linked to this asset
  const issuesStmt = db.prepare('SELECT * FROM issues');
  const allIssues = await issuesStmt.all();
  const openIssues = allIssues.filter((issue: any) => 
    issue.asset_id === asset.id &&
    !['closed', 'resolved', 'verified'].includes(issue.status)
  );
  score -= Math.min(openIssues.length * 8, 40); // -8 per open issue, max -40

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Get asset context: asset + linked issues + inspections + work orders
export async function getAssetContext(id: string): Promise<{
  asset: Asset;
  issues: any[];
  inspections: any[];
  workOrders: any[];
} | null> {
  const asset = await getAssetById(id);
  if (!asset) return null;

  const issues = await db.prepare('SELECT * FROM issues WHERE asset_id = ?').all(id);
  console.log(`[DEBUG] getAssetContext for ${id} returned ${issues.length} issues.`);

  // Get inspections linked to this asset
  const inspections = await db.prepare('SELECT * FROM inspections WHERE asset_id = ?').all(id);

  // Get work orders linked to this asset
  const workOrders = await db.prepare('SELECT * FROM work_orders WHERE asset_id = ?').all(id);

  return {
    asset,
    issues,
    inspections,
    workOrders,
  };
}

/**
 * Validates if a state transition is allowed according to business rules
 * Returns true if transition is valid, false otherwise
 */
export function isValidTransition(
  fromStatus: 'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed',
  toStatus: 'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed'
): boolean {
  // Define allowed transitions
  const allowedTransitions: Record<
    'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed',
    ('commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed')[]
  > = {
    // Commissioning -> Active (normal activation)
    commissioning: ['active'],

    // Active -> Maintenance (scheduled maintenance) or Repair (unexpected failure)
    active: ['maintenance', 'repair', 'decommissioned'],

    // Maintenance -> Active (completed maintenance) or Repair (issue found)
    maintenance: ['active', 'repair'],

    // Repair -> Active (fixed) or Maintenance (needs more work)
    repair: ['active', 'maintenance'],

    // Decommissioned -> Disposed (final removal) or Reactivate (rare cases)
    decommissioned: ['disposed', 'active'],

    // Disposed -> (terminal state, no transitions out)
    disposed: []
  };

  return allowedTransitions[fromStatus].includes(toStatus);
}

/**
 * Logs a state transition in the asset's history
 */
export async function logTransition(
  assetId: string,
  fromStatus: string,
  toStatus: string,
  reason: string,
  userId: string
): Promise<void> {
  const asset = await getAssetById(assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }

  const transition = {
    from_status: fromStatus,
    to_status: toStatus,
    reason: reason,
    user_id: userId,
    timestamp: new Date().toISOString()
  };

  const history = asset.transition_history || [];
  history.push(transition);

  await db.prepare(
    'UPDATE assets SET transition_history = ?, updated_at = ? WHERE id = ?'
  ).run(
    JSON.stringify(history),
    new Date().toISOString(),
    assetId
  );
}

/**
 * Transitions an asset to a new status with validation
 * Throws error if transition is invalid
 */
export async function transitionAssetState(
  assetId: string,
  newStatus: 'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed',
  reason: string,
  userId: string
): Promise<Asset> {
  const asset = await getAssetById(assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }

  // Validate the transition is allowed
  if (!isValidTransition(asset.status, newStatus)) {
    throw new Error(
      `Invalid state transition from ${asset.status} to ${newStatus}. ` +
      `Allowed transitions: ${getAllowedTransitions(asset.status).join(', ')}`
    );
  }

  // Log the transition before making changes
  await logTransition(assetId, asset.status, newStatus, reason, userId);

  // Update the asset status
  const updatedAsset = await updateAsset(assetId, {
    status: newStatus
  });

  if (!updatedAsset) {
    throw new Error(`Failed to update asset ${assetId}`);
  }

  // Log state change event
  try {
    await logAssetEvent({
      asset_id: assetId,
      event_type: 'state_changed',
      title: `Status changed: ${asset.status} → ${newStatus}`,
      description: reason,
      metadata: { from_status: asset.status, to_status: newStatus },
      user_id: userId,
    });
  } catch (e) { console.error('Failed to log state change event:', e); }

  return updatedAsset;
}

/**
 * Helper function to get allowed transitions for a status
 */
export function getAllowedTransitions(
  status: 'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed'
): ('commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed')[] {
  const allowedTransitions: Record<
    'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed',
    ('commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed')[]
  > = {
    commissioning: ['active'],
    active: ['maintenance', 'repair', 'decommissioned'],
    maintenance: ['active', 'repair'],
    repair: ['active', 'maintenance'],
    decommissioned: ['disposed', 'active'],
    disposed: []
  };

  return allowedTransitions[status];
}

export async function createWorkOrder(data: {
  asset_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
}) {
  const id = generateId();
  const now = new Date().toISOString();
  
  const sql = `INSERT INTO work_orders (id, asset_id, title, description, priority, status, due_date, assigned_to, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
               
  await db.prepare(sql).run(
    id,
    data.asset_id,
    data.title,
    data.description,
    data.priority,
    data.status,
    data.due_date || null,
    data.assigned_to || null,
    now,
    now
  );
  
  return { id, ...data, created_at: now, updated_at: now };
}

export async function updateWorkOrder(id: string, data: any) {
  const existing = db.prepare('SELECT * FROM work_orders WHERE id = ?').get(id);
  if (!existing) return null;
  
  const now = new Date().toISOString();
  const updated = { ...existing, ...data, updated_at: now };
  
  const sql = `UPDATE work_orders SET 
                title = ?, description = ?, priority = ?, status = ?, due_date = ?, assigned_to = ?, updated_at = ?
               WHERE id = ?`;
               
  await db.prepare(sql).run(
    updated.title,
    updated.description,
    updated.priority,
    updated.status,
    updated.due_date,
    updated.assigned_to,
    now,
    id
  );
  
  return updated;
}

export async function getRecentInspections(limit: number = 5) {
  const inspections = db.prepare('SELECT * FROM inspections ORDER BY created_at DESC').all() as any[];
  const assets = db.prepare('SELECT id, name FROM assets').all() as any[];
  const assetMap = new Map(assets.map(a => [a.id, a.name]));

  return inspections.slice(0, limit).map(i => ({
    ...i,
    assetName: assetMap.get(i.asset_id) || 'Unknown Asset'
  }));
}
