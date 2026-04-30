import { Inspection, InspectionItem } from '../types/inspection';
export declare function createInspection(data: {
    walkthrough_id: string;
    scene_id?: string;
    title: string;
    items: Omit<InspectionItem, 'id' | 'checked'>[];
}): Promise<Inspection>;
export declare function getInspections(walkthrough_id?: string): Promise<Inspection[]>;
export declare function getInspectionById(id: string): Promise<Inspection | null>;
export declare function updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | null>;
export declare function toggleInspectionItem(inspectionId: string, itemId: string): Promise<Inspection | null>;
export declare function signOffInspection(inspectionId: string): Promise<Inspection | null>;
export declare function scheduleInspectionForAsset(params: {
    asset_id: string;
    walkthrough_id: string;
    due_date: string;
    checklist: string[];
}): Promise<Inspection>;
//# sourceMappingURL=inspection.service.d.ts.map