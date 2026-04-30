"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInspection = createInspection;
exports.getInspections = getInspections;
exports.getInspectionById = getInspectionById;
exports.updateInspection = updateInspection;
exports.toggleInspectionItem = toggleInspectionItem;
exports.signOffInspection = signOffInspection;
exports.scheduleInspectionForAsset = scheduleInspectionForAsset;
const database_1 = __importStar(require("../config/database"));
const db = database_1.default.tables;
const generateId_1 = require("../utils/generateId");
function now() { return new Date().toISOString(); }
async function createInspection(data) {
    const id = (0, generateId_1.generateId)();
    const inspection = {
        id,
        walkthrough_id: data.walkthrough_id,
        scene_id: data.scene_id || undefined,
        title: data.title,
        status: 'in_progress',
        items: data.items.map((item, index) => ({
            ...item,
            id: (0, generateId_1.generateId)() + '_' + index,
            checked: false,
        })),
        created_at: now(),
        updated_at: now(),
    };
    const inspections = db['inspections'] || [];
    inspections.push(inspection);
    (0, database_1.save)();
    return inspection;
}
async function getInspections(walkthrough_id) {
    const inspections = db['inspections'] || [];
    let filtered = inspections;
    if (walkthrough_id) {
        filtered = filtered.filter(i => i.walkthrough_id === walkthrough_id);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
async function getInspectionById(id) {
    const inspections = db['inspections'] || [];
    return inspections.find(i => i.id === id) || null;
}
async function updateInspection(id, data) {
    const inspections = db['inspections'] || [];
    const index = inspections.findIndex(i => i.id === id);
    if (index === -1)
        return null;
    inspections[index] = { ...inspections[index], ...data, updated_at: now() };
    (0, database_1.save)();
    return inspections[index];
}
async function toggleInspectionItem(inspectionId, itemId) {
    const inspection = await getInspectionById(inspectionId);
    if (!inspection)
        return null;
    inspection.items = inspection.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item);
    return updateInspection(inspectionId, { items: inspection.items });
}
async function signOffInspection(inspectionId) {
    return updateInspection(inspectionId, { status: 'signed_off', signed_off_at: now() });
}
// Schedule a new inspection for an asset with auto-generated checklist
async function scheduleInspectionForAsset(params) {
    const { asset_id, walkthrough_id, due_date, checklist } = params;
    const items = checklist.map(label => ({
        label,
        checked: false,
        created_at: now(),
    }));
    // Create inspection linked to the asset
    const inspection = await createInspection({
        walkthrough_id,
        title: `Inspection for asset ${asset_id}`,
        items,
    });
    // Update with extra fields: due_date, asset_id, auto_generated
    await updateInspection(inspection.id, {
        asset_id,
        due_date,
        auto_generated: true,
    });
    // Return updated inspection
    const updated = await getInspectionById(inspection.id);
    return updated;
}
//# sourceMappingURL=inspection.service.js.map