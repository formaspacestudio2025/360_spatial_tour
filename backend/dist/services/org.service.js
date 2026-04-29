"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrg = createOrg;
exports.getOrgs = getOrgs;
exports.getOrgById = getOrgById;
exports.updateOrg = updateOrg;
exports.deleteOrg = deleteOrg;
const database_1 = __importDefault(require("../config/database"));
const generateId_1 = require("../utils/generateId");
/**
 * Organization Service - CRUD operations for organizations.
 */
async function createOrg(data) {
    const id = (0, generateId_1.generateId)();
    const now = new Date().toISOString();
    const sql = `INSERT INTO organizations (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`;
    await database_1.default.prepare(sql).run(id, data.name, now, now);
    return {
        id,
        name: data.name,
        created_at: now,
        updated_at: now,
    };
}
async function getOrgs() {
    const stmt = database_1.default.prepare('SELECT * FROM organizations');
    return stmt.all();
}
async function getOrgById(id) {
    const stmt = database_1.default.prepare('SELECT * FROM organizations WHERE id = ?');
    return stmt.get(id) || null;
}
async function updateOrg(id, data) {
    const existing = await database_1.default.prepare('SELECT * FROM organizations WHERE id = ?').get(id);
    if (!existing)
        return null;
    const now = new Date().toISOString();
    const updated = { ...existing, ...data, updated_at: now };
    const sql = `UPDATE organizations SET name = ?, updated_at = ? WHERE id = ?`;
    await database_1.default.prepare(sql).run(updated.name, now, id);
    return updated;
}
async function deleteOrg(id) {
    const result = await database_1.default.prepare('DELETE FROM organizations WHERE id = ?').run(id);
    return result.changes > 0;
}
//# sourceMappingURL=org.service.js.map