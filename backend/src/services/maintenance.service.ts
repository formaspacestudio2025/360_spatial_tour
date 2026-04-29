import db from '../config/database';
import { generateId } from '../utils/generateId';
import { MaintenanceSchedule } from '../types/maintenance';

function now() { return new Date().toISOString(); }

export async function createSchedule(data: {
  asset_id: string;
  frequency_days: number;
  next_due_date?: string;
}): Promise<MaintenanceSchedule> {
  const id = generateId();
  const nextDue = data.next_due_date || new Date(Date.now() + data.frequency_days * 86400000).toISOString();
  const schedule: MaintenanceSchedule = {
    id,
    asset_id: data.asset_id,
    frequency_days: data.frequency_days,
    next_due_date: nextDue,
    status: 'active',
    created_at: now(),
    updated_at: now(),
  };
  const table = (db as any)['maintenance_schedules'] as any[];
  table.push(schedule);
  // save handled by db wrapper
  return schedule;
}

export async function getSchedulesByAsset(asset_id: string): Promise<MaintenanceSchedule[]> {
  const table = (db as any)['maintenance_schedules'] as any[] || [];
  return table.filter(s => s.asset_id === asset_id);
}

export async function getScheduleById(id: string): Promise<MaintenanceSchedule | null> {
  const table = (db as any)['maintenance_schedules'] as any[] || [];
  return table.find(s => s.id === id) || null;
}

export async function updateSchedule(id: string, data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule | null> {
  const table = (db as any)['maintenance_schedules'] as any[] || [];
  const idx = table.findIndex(s => s.id === id);
  if (idx === -1) return null;
  table[idx] = { ...table[idx], ...data, updated_at: now() };
  return table[idx];
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const table = (db as any)['maintenance_schedules'] as any[] || [];
  const idx = table.findIndex(s => s.id === id);
  if (idx === -1) return false;
  table.splice(idx, 1);
  return true;
}

// Placeholder for auto-creating work orders (not implemented yet)
export async function generateWorkOrders(): Promise<void> {
  const table = (db as any)['maintenance_schedules'] as any[] || [];
  const nowDate = new Date();
  for (const sched of table) {
    if (sched.status !== 'active') continue;
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
