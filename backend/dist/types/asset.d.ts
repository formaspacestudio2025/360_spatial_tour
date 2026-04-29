export interface Asset {
    id: string;
    name: string;
    type: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    scene_id?: string;
    yaw?: number;
    pitch?: number;
    floor?: number;
    room?: string;
    status: 'active' | 'maintenance' | 'retired';
    walkthrough_id?: string;
    org_id?: string;
    property_id?: string;
    purchase_date?: string;
    warranty_date?: string;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=asset.d.ts.map