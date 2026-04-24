export interface HotspotMedia {
    id: string;
    hotspot_id: string;
    file_name: string;
    file_type: string;
    file_size?: number;
    file_path: string;
    file_url?: string;
    thumbnail_path?: string;
    thumbnail_url?: string;
    title?: string;
    description?: string;
    sort_order: number;
    uploaded_by?: string;
    created_at: string;
}
export interface CreateHotspotMediaData {
    hotspot_id: string;
    file_name: string;
    file_type: string;
    file_size?: number;
    file_path: string;
    title?: string;
    description?: string;
    sort_order?: number;
    uploaded_by?: string;
}
export declare class HotspotMediaService {
    /**
     * Add media to hotspot
     */
    create(data: CreateHotspotMediaData): HotspotMedia;
    /**
     * Get all media for a hotspot
     */
    getByHotspot(hotspotId: string): HotspotMedia[];
    /**
     * Get media by ID
     */
    getById(id: string): HotspotMedia | undefined;
    /**
     * Update media metadata
     */
    update(id: string, data: Partial<CreateHotspotMediaData>): HotspotMedia | null;
    /**
     * Delete media and file
     */
    delete(id: string): boolean;
    /**
     * Bulk delete media
     */
    bulkDelete(ids: string[]): number;
    /**
     * Reorder media
     */
    reorder(hotspotId: string, mediaIds: string[]): boolean;
}
export declare const hotspotMediaService: HotspotMediaService;
//# sourceMappingURL=hotspot-media.service.d.ts.map