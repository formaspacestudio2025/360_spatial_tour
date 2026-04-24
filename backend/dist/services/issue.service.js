"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssue = createIssue;
exports.getIssues = getIssues;
const database_1 = __importDefault(require("../config/database"));
const generateId_1 = require("../utils/generateId");
async function createIssue(data) {
    const id = (0, generateId_1.generateId)();
    const now = new Date().toISOString();
    const sql = `INSERT INTO issues (id, walkthrough_id, scene_id, type, severity, status, title, description, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)`;
    await database_1.default.prepare(sql).run(id, data.walkthrough_id, data.scene_id, data.type, data.severity, data.title, data.description || '', now, now);
    return { id, ...data, status: 'open', created_at: now, updated_at: now };
}
async function getIssues() {
    const sql = 'SELECT * FROM issues ORDER BY created_at DESC';
    const stmt = database_1.default.prepare(sql);
    const issues = await stmt.all();
    return issues;
}
//# sourceMappingURL=issue.service.js.map