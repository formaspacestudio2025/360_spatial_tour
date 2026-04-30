"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLifecycle = calculateLifecycle;
exports.createAsset = createAsset;
exports.getAssets = getAssets;
exports.getAssetStats = getAssetStats;
exports.getAssetById = getAssetById;
exports.updateAsset = updateAsset;
exports.deleteAsset = deleteAsset;
exports.addAssetDocument = addAssetDocument;
exports.getAssetDocuments = getAssetDocuments;
exports.deleteAssetDocument = deleteAssetDocument;
exports.updateAssetSceneMapping = updateAssetSceneMapping;
exports.getAssetsByScene = getAssetsByScene;
exports.calculateHealthScore = calculateHealthScore;
const database_1 = __importDefault(require("../config/database"));
const generateId_1 = require("../utils/generateId");
function calculateLifecycle(asset) {
    const now = new Date();
    let ageYears = null;
    let ageMonths = null;
    let warrantyExpired = false;
    let warrantyDaysRemaining = null;
    let warrantyStatus = 'not_set';
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
        }
        else if (warrantyDaysRemaining <= 30) {
            warrantyStatus = 'expiring_soon';
        }
        else {
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
async function createAsset(data) {
    const id = (0, generateId_1.generateId)();
    const now = new Date().toISOString();
    const sql = `INSERT INTO assets (id, name, type, brand, model, serial_number, scene_id, yaw, pitch, floor, room, status, walkthrough_id, org_id, property_id, purchase_date, warranty_date, compliance, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await database_1.default.prepare(sql).run(id, data.name, data.type, data.brand || null, data.model || null, data.serial_number || null, data.scene_id || null, data.yaw ?? null, data.pitch ?? null, data.floor ?? null, data.room || null, data.status || 'active', data.walkthrough_id || null, data.org_id || null, data.property_id || null, data.purchase_date || null, data.warranty_date || null, data.compliance ? JSON.stringify(data.compliance) : null, now, now);
    return {
        id,
        ...data,
        status: data.status || 'active',
        created_at: now,
        updated_at: now,
    };
}
async function getAssets(walkthrough_id, page = 1, limit = 10) {
    // Base query – fetch all assets (will filter in memory for simplicity)
    const stmt = database_1.default.prepare('SELECT * FROM assets');
    let assets = await stmt.all();
    // Optional walkthrough filter
    if (walkthrough_id) {
        assets = assets.filter((a) => a.walkthrough_id === walkthrough_id);
    }
    // Sort newest first
    assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Calculate health scores for all assets (for listing)
    for (const asset of assets) {
        asset.health_score = await calculateHealthScore(asset);
    }
    const total = assets.length;
    const start = (page - 1) * limit;
    const paged = assets.slice(start, start + limit);
    return { assets: paged, total, page, limit };
}
// Get asset statistics for dashboard
async function getAssetStats() {
    const stmt = database_1.default.prepare('SELECT * FROM assets');
    const assets = await stmt.all();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);
    let excellent = 0, good = 0, fair = 0, poor = 0;
    let warrantyExpiringSoon = 0;
    for (const asset of assets) {
        const score = await calculateHealthScore(asset);
        if (score >= 80)
            excellent++;
        else if (score >= 60)
            good++;
        else if (score >= 40)
            fair++;
        else
            poor++;
        if (asset.warranty_date) {
            const warranty = new Date(asset.warranty_date);
            if (warranty <= thirtyDaysFromNow && warranty >= now)
                warrantyExpiringSoon++;
        }
    }
    // Count overdue inspections (due_date passed)
    const inspStmt = database_1.default.prepare('SELECT * FROM inspections');
    const inspections = inspStmt.all() || [];
    const overdueInspections = inspections.filter((i) => i.due_date && new Date(i.due_date) < now).length;
    return {
        total: assets.length,
        byHealth: { excellent, good, fair, poor },
        warrantyExpiringSoon,
        overdueInspections,
    };
}
async function getAssetById(id) {
    const stmt = database_1.default.prepare('SELECT * FROM assets WHERE id = ?');
    const asset = stmt.get(id) || null;
    if (asset) {
        asset.health_score = await calculateHealthScore(asset);
        // Parse compliance JSON if stored as string
        if (asset.compliance && typeof asset.compliance === 'string') {
            try {
                asset.compliance = JSON.parse(asset.compliance);
            }
            catch { }
        }
    }
    return asset;
}
async function updateAsset(id, data) {
    const existing = await database_1.default.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    if (!existing)
        return null;
    const now = new Date().toISOString();
    const updated = { ...existing, ...data, updated_at: now };
    const sql = `UPDATE assets SET
                name = ?, type = ?, brand = ?, model = ?, serial_number = ?,
                scene_id = ?, yaw = ?, pitch = ?, floor = ?, room = ?,
                status = ?, walkthrough_id = ?, org_id = ?, property_id = ?, purchase_date = ?, warranty_date = ?, compliance = ?, updated_at = ?
                WHERE id = ?`;
    await database_1.default.prepare(sql).run(updated.name, updated.type, updated.brand || null, updated.model || null, updated.serial_number || null, updated.scene_id || null, updated.yaw ?? null, updated.pitch ?? null, updated.floor ?? null, updated.room || null, updated.status, updated.walkthrough_id || null, updated.org_id || null, updated.property_id || null, updated.purchase_date || null, updated.warranty_date || null, updated.compliance ? JSON.stringify(updated.compliance) : null, now, id);
    return updated;
}
async function deleteAsset(id) {
    const result = await database_1.default.prepare('DELETE FROM assets WHERE id = ?').run(id);
    return result.changes > 0;
}
async function addAssetDocument(id, doc) {
    const asset = await getAssetById(id);
    if (!asset)
        return null;
    const documents = asset.documents || [];
    documents.push(doc);
    await database_1.default.prepare('UPDATE assets SET documents = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(documents), new Date().toISOString(), id);
    return { ...asset, documents };
}
async function getAssetDocuments(id) {
    const asset = await getAssetById(id);
    if (!asset)
        return [];
    return asset.documents || [];
}
async function deleteAssetDocument(id, filename) {
    const asset = await getAssetById(id);
    if (!asset || !asset.documents)
        return false;
    const documents = asset.documents.filter((d) => d.filename !== filename);
    await database_1.default.prepare('UPDATE assets SET documents = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(documents), new Date().toISOString(), id);
    return true;
}
async function updateAssetSceneMapping(id, mapping) {
    const existing = await database_1.default.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    if (!existing)
        return null;
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
    await database_1.default.prepare(sql).run(updated.scene_id, updated.yaw, updated.pitch, updated.floor, updated.room, now, id);
    return updated;
}
async function getAssetsByScene(scene_id) {
    const stmt = database_1.default.prepare('SELECT * FROM assets WHERE scene_id = ?');
    const assets = await stmt.all(scene_id);
    // Sort by created_at descending
    assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return assets;
}
async function calculateHealthScore(asset) {
    let score = 100;
    // Factor 1: Warranty status
    if (asset.warranty_date) {
        const warranty = new Date(asset.warranty_date);
        const now = new Date();
        if (warranty < now) {
            score -= 30; // Expired warranty
        }
        else {
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
    if (asset.status === 'maintenance') {
        score -= 10;
    }
    else if (asset.status === 'retired') {
        score -= 50;
    }
    // Factor 4: Open issues in same scene
    if (asset.scene_id) {
        const issuesStmt = database_1.default.prepare('SELECT * FROM issues WHERE scene_id = ?');
        const issues = await issuesStmt.all(asset.scene_id);
        const openIssues = issues.filter((issue) => issue.status !== 'closed' && issue.status !== 'resolved');
        score -= Math.min(openIssues.length * 5, 30); // -5 per open issue, max -30
    }
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
}
//# sourceMappingURL=asset.service.js.map