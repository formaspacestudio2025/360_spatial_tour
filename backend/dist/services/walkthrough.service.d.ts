export interface Walkthrough {
    id: string;
    name: string;
    client?: string;
    address?: string;
    status: 'draft' | 'active' | 'archived';
    description?: string;
    created_by?: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
    updated_at: string;
}
export interface CreateWalkthroughData {
    name: string;
    client?: string;
    address?: string;
    status?: 'draft' | 'active' | 'archived';
    description?: string;
    created_by?: string;
    latitude?: number;
    longitude?: number;
}
export interface WalkthroughQuery {
    search?: string;
    status?: string;
    client?: string;
}
export declare class WalkthroughService {
    /**
     * Create a new walkthrough
     */
    create(data: CreateWalkthroughData): Walkthrough;
    /**
     * Get all walkthroughs with optional search and filter
     */
    getAll(query?: WalkthroughQuery): (Walkthrough & {
        scene_count: number;
    })[];
    /**
     * Get unique clients for filter dropdown
     */
    getClients(): string[];
    /**
     * Get walkthrough by ID
     */
    getById(id: string): Walkthrough | undefined;
    /**
     * Update walkthrough
     */
    update(id: string, data: Partial<CreateWalkthroughData>): Walkthrough | null;
    /**
     * Delete walkthrough
     */
    delete(id: string): boolean;
    /**
     * Get walkthrough with scene count
     */
    getWithStats(id: string): (Walkthrough & {
        scene_count: number;
    }) | undefined;
}
export declare const walkthroughService: WalkthroughService;
//# sourceMappingURL=walkthrough.service.d.ts.map