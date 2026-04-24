"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_PROMPTS = exports.lmStudioClient = void 0;
exports.updateLMStudioConfig = updateLMStudioConfig;
exports.getLMStudioConfig = getLMStudioConfig;
exports.testLMStudioConnection = testLMStudioConnection;
exports.analyzeImage = analyzeImage;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Runtime LM Studio configuration (can be updated via API)
let runtimeConfig = {
    baseUrl: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
    model: process.env.LM_STUDIO_MODEL || 'local-model',
};
// LM Studio API Configuration
const lmStudioConfig = {
    baseURL: runtimeConfig.baseUrl,
    apiKey: process.env.LM_STUDIO_API_KEY || 'not-needed',
};
// Create OpenAI-compatible client for LM Studio
exports.lmStudioClient = new openai_1.default(lmStudioConfig);
// Update client baseURL when config changes
function updateLMStudioConfig(config) {
    runtimeConfig = config;
    exports.lmStudioClient.baseURL = config.baseUrl;
}
function getLMStudioConfig() {
    return { ...runtimeConfig };
}
async function testLMStudioConnection() {
    try {
        const response = await exports.lmStudioClient.models.list();
        const models = response.data;
        if (models && models.length > 0) {
            return { connected: true, model: models[0].id };
        }
        return { connected: true };
    }
    catch (error) {
        return { connected: false, error: error.message || 'Connection failed' };
    }
}
// AI Prompts
exports.AI_PROMPTS = {
    OBJECT_DETECTION: `Analyze this 360° indoor scene image. Identify and list all objects, furniture, equipment, and structural elements. For each object provide: type, location in image (bounding box as % coordinates), confidence level (0-1), and any relevant tags. Return as JSON array.`,
    DAMAGE_DETECTION: `Inspect this scene for any damage, hazards, or maintenance issues. Identify: water damage, cracks, broken items, safety violations, fire hazards, blocked exits. Return structured JSON with issue type, severity (low/medium/high/critical), location, and description.`,
    SPATIAL_ANALYSIS: `Analyze relationships between objects in this scene. Identify: connected systems (HVAC, electrical), structural dependencies, safety equipment locations, accessibility features. Return JSON with object pairs and relationship types.`,
};
// Helper function to analyze image
async function analyzeImage(imageBase64, prompt) {
    try {
        const response = await exports.lmStudioClient.chat.completions.create({
            model: process.env.LM_STUDIO_MODEL || 'local-model',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                        },
                    ],
                },
            ],
            max_tokens: 2000,
            temperature: 0.3,
        });
        return response.choices[0].message.content || '';
    }
    catch (error) {
        console.error('LM Studio API error:', error);
        throw new Error('AI processing failed. Make sure LM Studio is running with a vision-enabled model.');
    }
}
//# sourceMappingURL=lmstudio.js.map