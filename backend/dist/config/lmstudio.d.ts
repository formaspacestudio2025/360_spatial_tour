import OpenAI from 'openai';
export declare const lmStudioClient: OpenAI;
export declare function updateLMStudioConfig(config: {
    baseUrl: string;
    model: string;
}): void;
export declare function getLMStudioConfig(): {
    baseUrl: string;
    model: string;
};
export declare function testLMStudioConnection(): Promise<{
    connected: boolean;
    model?: string;
    error?: string;
}>;
export declare const AI_PROMPTS: {
    readonly OBJECT_DETECTION: "Analyze this 360° indoor scene image. Identify and list all objects, furniture, equipment, and structural elements. For each object provide: type, location in image (bounding box as % coordinates), confidence level (0-1), and any relevant tags. Return as JSON array.";
    readonly DAMAGE_DETECTION: "Inspect this scene for any damage, hazards, or maintenance issues. Identify: water damage, cracks, broken items, safety violations, fire hazards, blocked exits. Return structured JSON with issue type, severity (low/medium/high/critical), location, and description.";
    readonly SPATIAL_ANALYSIS: "Analyze relationships between objects in this scene. Identify: connected systems (HVAC, electrical), structural dependencies, safety equipment locations, accessibility features. Return JSON with object pairs and relationship types.";
};
export declare function analyzeImage(imageBase64: string, prompt: string): Promise<string>;
//# sourceMappingURL=lmstudio.d.ts.map