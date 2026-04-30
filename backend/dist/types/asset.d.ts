export interface AssetDocument {
    filename: string;
    originalname: string;
    path: string;
    size: number;
    uploaded_at: string;
    mimetype: string;
}
export interface ComplianceTag {
    regulation: string;
    status: 'pass' | 'fail' | 'pending';
    note?: string;
    checked_at?: string;
}
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
    documents?: AssetDocument[];
    health_score?: number;
    compliance?: ComplianceTag[];
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=asset.d.ts.map