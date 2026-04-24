"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
database_1.default.prepare(`
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    walkthrough_id TEXT NOT NULL,
    scene_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('damage', 'safety', 'maintenance', 'compliance', 'custom')) NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`).run();
exports.default = database_1.default;
//# sourceMappingURL=database.js.map