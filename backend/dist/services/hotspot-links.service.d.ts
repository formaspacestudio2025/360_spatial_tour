export interface HotspotLink {
    id: string;
    hotspot_id: string;
    title: string;
    url: string;
    description?: string;
    category: string;
    favicon_url?: string;
    sort_order: number;
    created_at: string;
}
export interface CreateHotspotLinkData {
    hotspot_id: string;
    title: string;
    url: string;
    description?: string;
    category?: string;
    sort_order?: number;
}
export declare class HotspotLinkService {
    /**
     * Create a link
     */
    create(data: CreateHotspotLinkData): HotspotLink;
    /**
     * Get all links for a hotspot
     */
    getByHotspot(hotspotId: string): HotspotLink[];
    /**
     * Get link by ID
     */
    getById(id: string): HotspotLink | undefined;
    /**
     * Update link
     */
    update(id: string, data: Partial<CreateHotspotLinkData>): HotspotLink | null;
    /**
     * Delete link
     */
    delete(id: string): boolean;
    /**
     * Bulk delete links
     */
    bulkDelete(ids: string[]): number;
    /**
     * Reorder links
     */
    reorder(hotspotId: string, linkIds: string[]): boolean;
}
export declare const hotspotLinkService: HotspotLinkService;
//# sourceMappingURL=hotspot-links.service.d.ts.map