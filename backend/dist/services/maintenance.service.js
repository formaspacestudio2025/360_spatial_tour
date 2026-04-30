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
exports.createSchedule = createSchedule;
exports.getSchedulesByAsset = getSchedulesByAsset;
exports.getScheduleById = getScheduleById;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.generateWorkOrders = generateWorkOrders;
const database_1 = __importStar(require("../config/database"));
const db = database_1.default.tables;
const generateId_1 = require("../utils/generateId");
function now() { return new Date().toISOString(); }
async function createSchedule(data) {
    const id = (0, generateId_1.generateId)();
    const nextDue = data.next_due_date || new Date(Date.now() + data.frequency_days * 86400000).toISOString();
    const schedule = {
        id,
        asset_id: data.asset_id,
        frequency_days: data.frequency_days,
        next_due_date: nextDue,
        status: 'active',
        created_at: now(),
        updated_at: now(),
    };
    const table = db['maintenance_schedules'];
    table.push(schedule);
    (0, database_1.save)();
    return schedule;
}
async function getSchedulesByAsset(asset_id) {
    const table = db['maintenance_schedules'] || [];
    return table.filter(s => s.asset_id === asset_id);
}
async function getScheduleById(id) {
    const table = db['maintenance_schedules'] || [];
    return table.find(s => s.id === id) || null;
}
async function updateSchedule(id, data) {
    const table = db['maintenance_schedules'] || [];
    const idx = table.findIndex(s => s.id === id);
    if (idx === -1)
        return null;
    table[idx] = { ...table[idx], ...data, updated_at: now() };
    (0, database_1.save)();
    return table[idx];
}
async function deleteSchedule(id) {
    const table = db['maintenance_schedules'] || [];
    const idx = table.findIndex(s => s.id === id);
    if (idx === -1)
        return false;
    table.splice(idx, 1);
    (0, database_1.save)();
    return true;
}
// Placeholder for auto-creating work orders (not implemented yet)
async function generateWorkOrders() {
    const table = db['maintenance_schedules'] || [];
    const nowDate = new Date();
    for (const sched of table) {
        if (sched.status !== 'active')
            continue;
        const due = new Date(sched.next_due_date);
        if (due <= nowDate) {
            // In a real implementation, create a work order here
            console.log(`Should create work order for asset ${sched.asset_id}`);
            // Update next due date
            const next = new Date(due.getTime() + sched.frequency_days * 86400000);
            sched.next_due_date = next.toISOString();
            sched.last_completed_date = now();
            sched.updated_at = now();
        }
    }
}
//# sourceMappingURL=maintenance.service.js.map