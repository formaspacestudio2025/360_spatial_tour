import { MaintenanceSchedule } from '../types/maintenance';
export declare function createSchedule(data: {
    asset_id: string;
    frequency_days: number;
    next_due_date?: string;
}): Promise<MaintenanceSchedule>;
export declare function getSchedulesByAsset(asset_id: string): Promise<MaintenanceSchedule[]>;
export declare function getScheduleById(id: string): Promise<MaintenanceSchedule | null>;
export declare function updateSchedule(id: string, data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule | null>;
export declare function deleteSchedule(id: string): Promise<boolean>;
export declare function generateWorkOrders(): Promise<void>;
//# sourceMappingURL=maintenance.service.d.ts.map