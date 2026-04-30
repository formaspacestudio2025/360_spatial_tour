import database, { save } from '../config/database';
const db = database.tables;
import { generateId } from '../utils/generateId';
import { Inspection, InspectionItem } from '../types/inspection';

function now() { return new Date().toISOString(); }

export async function createInspection(data: {
  walkthrough_id: string;
  scene_id?: string;
  title: string;
  items: Omit<InspectionItem, 'id' | 'checked'>[];
}): Promise<Inspection> {
  const id = generateId();
  const inspection: Inspection = {
    id,
    walkthrough_id: data.walkthrough_id,
    scene_id: data.scene_id || undefined,
    title: data.title,
    status: 'in_progress',
    items: data.items.map((item, index) => ({
      ...item,
      id: generateId() + '_' + index,
      checked: false,
    })),
    created_at: now(),
    updated_at: now(),
  };

  const inspections = db['inspections'] as Inspection[] || [];
  inspections.push(inspection);
  save();
  return inspection;
}

export async function getInspections(walkthrough_id?: string): Promise<Inspection[]> {
  const inspections: Inspection[] = (db['inspections'] as Inspection[]) || [];
  let filtered = inspections;
  if (walkthrough_id) {
    filtered = filtered.filter(i => i.walkthrough_id === walkthrough_id);
  }
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getInspectionById(id: string): Promise<Inspection | null> {
  const inspections: Inspection[] = (db['inspections'] as Inspection[]) || [];
  return inspections.find(i => i.id === id) || null;
}

export async function updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | null> {
  const inspections: Inspection[] = (db['inspections'] as Inspection[]) || [];
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) return null;

  inspections[index] = { ...inspections[index], ...data, updated_at: now() };
  save();
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
  return updateInspection(inspectionId, { status: 'signed_off', signed_off_at: now() });
}

// Schedule a new inspection for an asset with auto-generated checklist
export async function scheduleInspectionForAsset(params: {
  asset_id: string;
  walkthrough_id: string;
  due_date: string; // ISO date string
  checklist: string[]; // list of item labels
}): Promise<Inspection> {
  const { asset_id, walkthrough_id, due_date, checklist } = params;
  const items: Omit<InspectionItem, 'id' | 'checked'>[] = checklist.map(label => ({
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
  return updated as Inspection;
}
export async function deleteInspection(id: string): Promise<boolean> {
  const inspections: Inspection[] = (db['inspections'] as Inspection[]) || [];
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) return false;

  inspections.splice(index, 1);
  save();
  return true;
}
