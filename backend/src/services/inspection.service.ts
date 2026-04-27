import db from '../config/database';
import { generateId } from '../utils/generateId';
import { Inspection, InspectionItem } from '../types/inspection';

export async function createInspection(data: {
  walkthrough_id: string;
  scene_id?: string;
  title: string;
  items: Omit<InspectionItem, 'id' | 'checked'>[];
}): Promise<Inspection> {
  const id = generateId();
  const now = new Date().toISOString();

  const inspection: Inspection = {
    id,
    walkthrough_id: data.walkthrough_id,
    scene_id: data.scene_id || null,
    title: data.title,
    status: 'in_progress',
    items: data.items.map((item, index) => ({
      ...item,
      id: generateId() + '_' + index,
      checked: false,
    })),
    created_at: now,
    updated_at: now,
  };

  const stmt = db.prepare('SELECT * FROM inspections');
  const inspections = stmt.all() as Inspection[];
  inspections.push(inspection);
  db.prepare('UPDATE inspections SET data = ?').run(JSON.stringify(inspections));

  return inspection;
}

export async function getInspections(walkthrough_id?: string): Promise<Inspection[]> {
  const stmt = db.prepare('SELECT * FROM inspections');
  let inspections: Inspection[] = stmt.all() || [];

  if (walkthrough_id) {
    inspections = inspections.filter(i => i.walkthrough_id === walkthrough_id);
  }

  return inspections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getInspectionById(id: string): Promise<Inspection | null> {
  const stmt = db.prepare('SELECT * FROM inspections');
  const inspections: Inspection[] = stmt.all() || [];
  return inspections.find(i => i.id === id) || null;
}

export async function updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | null> {
  const stmt = db.prepare('SELECT * FROM inspections');
  const inspections: Inspection[] = stmt.all() || [];
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  inspections[index] = { ...inspections[index], ...data, updated_at: now };

  db.prepare('UPDATE inspections SET data = ?').run(JSON.stringify(inspections));
  return inspections[index];
}

export async function toggleInspectionItem(inspectionId: string, itemId: string): Promise<Inspection | null> {
  const inspection = await getInspectionById(inspectionId);
  if (!inspection) return null;

  inspection.items = inspection.items.map(item =>
    item.id === itemId ? { ...item, checked: !item.checked } : item
  );

  return updateInspection(inspectionId, { items: inspection.items });
}

export async function signOffInspection(inspectionId: string): Promise<Inspection | null> {
  return updateInspection(inspectionId, { status: 'signed_off', signed_off_at: new Date().toISOString() });
}
