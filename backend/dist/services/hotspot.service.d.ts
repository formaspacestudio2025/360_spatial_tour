export interface Hotspot {
    id: string;
    from_scene_id: string;
    to_scene_id: string;
    yaw: number;
    pitch: number;
    target_yaw?: number;
    target_pitch?: number;
    label?: string;
    icon_type?: string;
    icon_color?: string;
    title?: string;
    description?: string;
    media_type?: string;
    media_url?: string;
    custom_icon_url?: string;
    is_locked?: boolean;
    metadata?: any;
    animation_type?: string;
    animation_speed?: number;
    animation_intensity?: number;
    icon_size?: number;
    opacity?: number;
    label_position?: string;
    hover_scale?: number;
    visible_distance?: number;
    always_visible?: boolean;
    background_color?: string;
    created_at: string;
}
export interface CreateHotspotData {
    from_scene_id: string;
    to_scene_id: string;
    yaw: number;
    pitch: number;
    target_yaw?: number;
    target_pitch?: number;
    label?: string;
    icon_type?: string;
    icon_color?: string;
    title?: string;
    description?: string;
    media_type?: string;
    media_url?: string;
    custom_icon_url?: string;
    is_locked?: boolean;
    metadata?: any;
    animation_type?: string;
    animation_speed?: number;
    animation_intensity?: number;
    icon_size?: number;
    opacity?: number;
    label_position?: string;
    hover_scale?: number;
    visible_distance?: number;
    always_visible?: boolean;
    background_color?: string;
}
export declare class HotspotService {
    /**
     * Create a new hotspot
     */
    create(data: CreateHotspotData): Hotspot;
    /**
     * Get all hotspots for a scene
     */
    getByScene(sceneId: string): Hotspot[];
    /**
     * Get hotspot by ID
     */
    getById(id: string): Hotspot | undefined;
    /**
     * Update hotspot
     */
    update(id: string, data: Partial<CreateHotspotData>): Hotspot | null;
    /**
     * Delete hotspot
     */
    delete(id: string): boolean;
}
export declare const hotspotService: HotspotService;
//# sourceMappingURL=hotspot.service.d.ts.map