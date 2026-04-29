import db from '../config/database';
import { generateId } from '../utils/generateId';
import { ChecklistTemplate, ChecklistItemTemplate } from '../types/checklist';

function now() { return new Date().toISOString(); }

export async function createTemplate(data: {
  name: string;
  description?: string;
  asset_type?: string;
  items: Omit<ChecklistItemTemplate, 'id'>[];
}): Promise<ChecklistTemplate> {
  const id = generateId();
  const template: ChecklistTemplate = {
    id,
    name: data.name,
    description: data.description,
    asset_type: data.asset_type,
    items: data.items.map((item, idx) => ({ ...item, id: generateId() + '_' + idx })),
    created_at: now(),
    updated_at: now(),
  };
  const table = (db as any)['checklist_templates'] as any[];
  table.push(template);
  return template;
}

export async function getTemplates(asset_type?: string): Promise<ChecklistTemplate[]> {
  const table = (db as any)['checklist_templates'] as any[] || [];
  let templates = table as ChecklistTemplate[];
  if (asset_type) {
    templates = templates.filter(t => t.asset_type === asset_type);
  }
  return templates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getTemplateById(id: string): Promise<ChecklistTemplate | null> {
  const table = (db as any)['checklist_templates'] as any[] || [];
  return (table as ChecklistTemplate[]).find(t => t.id === id) || null;
}

export async function updateTemplate(id: string, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate | null> {
  const table = (db as any)['checklist_templates'] as any[] || [];
  const idx = table.findIndex((t: any) => t.id === id);
  if (idx === -1) return null;
  table[idx] = { ...table[idx], ...data, updated_at: now() };
  return table[idx] as ChecklistTemplate;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const table = (db as any)['checklist_templates'] as any[] || [];
  const idx = table.findIndex((t: any) => t.id === id);
  if (idx === -1) return false;
  table.splice(idx, 1);
  return true;
}

// Assign template to asset by creating an inspection with template items
export async function assignTemplateToAsset(templateId: string, asset_id: string, walkthrough_id: string, due_date?: string): Promise<any> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error('Template not found');
  const { createInspection } = await import('./inspection.service');
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
  const { updateInspection } = await import('./inspection.service');
  await updateInspection(inspection.id, {
    asset_id,
    due_date,
    auto_generated: true,
  });
  return inspection;
}
