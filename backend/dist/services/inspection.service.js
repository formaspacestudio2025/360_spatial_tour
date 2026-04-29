"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInspection = createInspection;
exports.getInspections = getInspections;
exports.getInspectionById = getInspectionById;
exports.updateInspection = updateInspection;
exports.toggleInspectionItem = toggleInspectionItem;
exports.signOffInspection = signOffInspection;
const database_1 = __importDefault(require("../config/database"));
const generateId_1 = require("../utils/generateId");
async function createInspection(data) {
    const id = (0, generateId_1.generateId)();
    const now = new Date().toISOString();
    const inspection = {
        id,
        walkthrough_id: data.walkthrough_id,
        scene_id: data.scene_id || null,
        title: data.title,
        status: 'in_progress',
        items: data.items.map((item, index) => ({
            ...item,
            id: (0, generateId_1.generateId)() + '_' + index,
            checked: false,
        })),
        created_at: now,
        updated_at: now,
    };
    const stmt = database_1.default.prepare('SELECT * FROM inspections');
    const inspections = stmt.all();
    inspections.push(inspection);
    database_1.default.prepare('UPDATE inspections SET data = ?').run(JSON.stringify(inspections));
    return inspection;
}
async function getInspections(walkthrough_id) {
    const stmt = database_1.default.prepare('SELECT * FROM inspections');
    let inspections = stmt.all() || [];
    if (walkthrough_id) {
        inspections = inspections.filter(i => i.walkthrough_id === walkthrough_id);
    }
    return inspections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
async function getInspectionById(id) {
    const stmt = database_1.default.prepare('SELECT * FROM inspections');
    const inspections = stmt.all() || [];
    return inspections.find(i => i.id === id) || null;
}
async function updateInspection(id, data) {
    const stmt = database_1.default.prepare('SELECT * FROM inspections');
    const inspections = stmt.all() || [];
    const index = inspections.findIndex(i => i.id === id);
    if (index === -1)
        return null;
    const now = new Date().toISOString();
    inspections[index] = { ...inspections[index], ...data, updated_at: now };
    database_1.default.prepare('UPDATE inspections SET data = ?').run(JSON.stringify(inspections));
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
    return updateInspection(inspectionId, { status: 'signed_off', signed_off_at: new Date().toISOString() });
}
//# sourceMappingURL=inspection.service.js.map