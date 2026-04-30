export interface MaintenanceSchedule {
    id: string;
    asset_id: string;
    frequency_days: number;
    next_due_date: string;
    last_completed_date?: string;
    status: 'active' | 'paused' | 'completed';
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=maintenance.d.ts.map