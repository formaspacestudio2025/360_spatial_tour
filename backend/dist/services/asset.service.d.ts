import { Asset, AssetDocument, ComplianceTag } from '../types/asset';
export interface AssetLifecycle {
    ageYears: number | null;
    ageMonths: number | null;
    warrantyExpired: boolean;
    warrantyDaysRemaining: number | null;
    warrantyStatus: 'active' | 'expiring_soon' | 'expired' | 'not_set';
}
export declare function calculateLifecycle(asset: Asset): AssetLifecycle;
export declare function createAsset(data: {
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
    status?: 'active' | 'maintenance' | 'retired';
    walkthrough_id?: string;
    org_id?: string;
    property_id?: string;
    purchase_date?: string;
    warranty_date?: string;
    compliance?: ComplianceTag[];
}): Promise<Asset>;
export declare function getAssets(walkthrough_id?: string, page?: number, limit?: number): Promise<{
    assets: Asset[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getAssetStats(): Promise<{
    total: number;
    byHealth: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
    };
    warrantyExpiringSoon: number;
    overdueInspections: number;
}>;
export declare function getAssetById(id: string): Promise<Asset | null>;
export declare function updateAsset(id: string, data: Partial<Asset>): Promise<Asset | null>;
export declare function deleteAsset(id: string): Promise<boolean>;
export declare function addAssetDocument(id: string, doc: AssetDocument): Promise<Asset | null>;
export declare function getAssetDocuments(id: string): Promise<AssetDocument[]>;
export declare function deleteAssetDocument(id: string, filename: string): Promise<boolean>;
export declare function updateAssetSceneMapping(id: string, mapping: {
    scene_id?: string;
    yaw?: number;
    pitch?: number;
    floor?: number;
    room?: string;
}): Promise<Asset | null>;
export declare function getAssetsByScene(scene_id: string): Promise<Asset[]>;
export declare function calculateHealthScore(asset: Asset): Promise<number>;
//# sourceMappingURL=asset.service.d.ts.map