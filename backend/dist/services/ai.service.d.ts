export interface AITag {
    id: string;
    scene_id: string;
    object_type: string;
    confidence: number;
    bounding_box?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    tags?: string[];
    ai_model?: string;
    processed_at: string;
}
export interface AIProcessingResult {
    scene_id: string;
    tags: AITag[];
    processing_time: number;
    model_used: string;
}
export declare class AIService {
    /**
     * Process a single scene with AI
     */
    processScene(sceneId: string): Promise<AIProcessingResult>;
    /**
     * Process all scenes in a walkthrough
     */
    processWalkthrough(walkthroughId: string): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    /**
     * Split equirectangular image into segments
     */
    private splitImageIntoSegments;
    /**
     * Parse AI response into tags
     */
    private parseAIResponse;
    /**
     * Save AI tags to database
     */
    private saveAITags;
    /**
     * Get AI tags for a scene
     */
    getTagsByScene(sceneId: string): AITag[];
    /**
     * Get all AI tags for a walkthrough
     */
    getTagsByWalkthrough(walkthroughId: string): AITag[];
    /**
     * Update AI tag
     */
    updateTag(tagId: string, updates: Partial<AITag>): boolean;
    /**
     * Delete AI tag
     */
    deleteTag(tagId: string): boolean;
    /**
     * Get LM Studio configuration
     */
    getConfig(): {
        baseUrl: string;
        model: string;
    };
    /**
     * Set LM Studio configuration
     */
    setConfig(config: {
        baseUrl: string;
        model: string;
    }): {
        success: boolean;
        config: {
            baseUrl: string;
            model: string;
        };
    };
    /**
     * Test LM Studio connection
     */
    testConnection(): Promise<{
        connected: boolean;
        model?: string;
        error?: string;
    }>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map