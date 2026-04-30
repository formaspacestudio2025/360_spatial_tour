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
exports.createTemplate = createTemplate;
exports.getTemplates = getTemplates;
exports.getTemplateById = getTemplateById;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
exports.assignTemplateToAsset = assignTemplateToAsset;
const database_1 = __importStar(require("../config/database"));
const db = database_1.default.tables;
const generateId_1 = require("../utils/generateId");
function now() { return new Date().toISOString(); }
async function createTemplate(data) {
    const id = (0, generateId_1.generateId)();
    const template = {
        id,
        name: data.name,
        description: data.description,
        asset_type: data.asset_type,
        items: data.items.map((item, idx) => ({ ...item, id: (0, generateId_1.generateId)() + '_' + idx })),
        created_at: now(),
        updated_at: now(),
    };
    const table = db['checklist_templates'];
    table.push(template);
    (0, database_1.save)();
    return template;
}
async function getTemplates(asset_type) {
    const table = db['checklist_templates'] || [];
    let templates = table;
    if (asset_type) {
        templates = templates.filter(t => t.asset_type === asset_type);
    }
    return templates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
async function getTemplateById(id) {
    const table = db['checklist_templates'] || [];
    return table.find(t => t.id === id) || null;
}
async function updateTemplate(id, data) {
    const table = db['checklist_templates'] || [];
    const idx = table.findIndex((t) => t.id === id);
    if (idx === -1)
        return null;
    table[idx] = { ...table[idx], ...data, updated_at: now() };
    (0, database_1.save)();
    return table[idx];
}
async function deleteTemplate(id) {
    const table = db['checklist_templates'] || [];
    const idx = table.findIndex((t) => t.id === id);
    if (idx === -1)
        return false;
    table.splice(idx, 1);
    (0, database_1.save)();
    return true;
}
// Assign template to asset by creating an inspection with template items
async function assignTemplateToAsset(templateId, asset_id, walkthrough_id, due_date) {
    const template = await getTemplateById(templateId);
    if (!template)
        throw new Error('Template not found');
    const { createInspection } = await Promise.resolve().then(() => __importStar(require('./inspection.service')));
    const items = template.items.map(item => ({
        label: item.label,
        checked: false,
        created_at: now(),
    }));
    const inspection = await createInspection({
        walkthrough_id,
        title: `Inspection from template: ${template.name}`,
        items,
    });
    // Update inspection with asset_id, due_date, auto_generated flag
    const { updateInspection } = await Promise.resolve().then(() => __importStar(require('./inspection.service')));
    await updateInspection(inspection.id, {
        asset_id,
        due_date,
        auto_generated: true,
    });
    return inspection;
}
//# sourceMappingURL=checklist.service.js.map