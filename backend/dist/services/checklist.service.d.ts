import { ChecklistTemplate, ChecklistItemTemplate } from '../types/checklist';
export declare function createTemplate(data: {
    name: string;
    description?: string;
    asset_type?: string;
    items: Omit<ChecklistItemTemplate, 'id'>[];
}): Promise<ChecklistTemplate>;
export declare function getTemplates(asset_type?: string): Promise<ChecklistTemplate[]>;
export declare function getTemplateById(id: string): Promise<ChecklistTemplate | null>;
export declare function updateTemplate(id: string, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate | null>;
export declare function deleteTemplate(id: string): Promise<boolean>;
export declare function assignTemplateToAsset(templateId: string, asset_id: string, walkthrough_id: string, due_date?: string): Promise<any>;
//# sourceMappingURL=checklist.service.d.ts.map