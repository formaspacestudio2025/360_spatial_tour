export interface Scene {
    id: string;
    walkthrough_id: string;
    image_path: string;
    thumbnail_path?: string;
    position_x: number;
    position_y: number;
    position_z: number;
    floor: number;
    room_name?: string;
    notes?: string;
    metadata?: string;
    created_at: string;
    nadir_image_path?: string;
    nadir_scale?: number;
    nadir_rotation?: number;
    nadir_opacity?: number;
}
export interface CreateSceneData {
    walkthrough_id: string;
    image_path: string;
    thumbnail_path?: string;
    position_x?: number;
    position_y?: number;
    position_z?: number;
    floor?: number;
    room_name?: string;
    notes?: string;
    metadata?: any;
    nadir_image_path?: string;
    nadir_scale?: number;
    nadir_rotation?: number;
    nadir_opacity?: number;
}
export declare class SceneService {
    /**
     * Create a new scene
     */
    create(data: CreateSceneData): Scene;
    /**
     * Get all scenes for a walkthrough
     */
    getByWalkthrough(walkthroughId: string): Scene[];
    /**
     * Get scene by ID
     */
    getById(id: string): Scene | undefined;
    /**
     * Update scene
     */
    update(id: string, data: Partial<CreateSceneData>): Scene | null;
    /**
     * Delete scene and remove files
     */
    delete(id: string): boolean;
    /**
     * Get scene with AI tag count and issue count
     */
    getWithStats(id: string): (Scene & {
        ai_tag_count: number;
        issue_count: number;
    }) | undefined;
}
export declare const sceneService: SceneService;
//# sourceMappingURL=scene.service.d.ts.map