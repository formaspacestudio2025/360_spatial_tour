import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Runtime LM Studio configuration (can be updated via API)
let runtimeConfig: { baseUrl: string; model: string } = {
  baseUrl: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
  model: process.env.LM_STUDIO_MODEL || 'local-model',
};

// LM Studio API Configuration
const lmStudioConfig = {
  baseURL: runtimeConfig.baseUrl,
  apiKey: process.env.LM_STUDIO_API_KEY || 'not-needed',
};

// Create OpenAI-compatible client for LM Studio
export const lmStudioClient = new OpenAI(lmStudioConfig);

// Update client baseURL when config changes
export function updateLMStudioConfig(config: { baseUrl: string; model: string }) {
  runtimeConfig = config;
  (lmStudioClient as any).baseURL = config.baseUrl;
}

export function getLMStudioConfig() {
  return { ...runtimeConfig };
}

export async function testLMStudioConnection(): Promise<{ connected: boolean; model?: string; error?: string }> {
  try {
    const response = await lmStudioClient.models.list();
    const models = response.data;
    if (models && models.length > 0) {
      return { connected: true, model: models[0].id };
    }
    return { connected: true };
  } catch (error: any) {
    return { connected: false, error: error.message || 'Connection failed' };
  }
}

// AI Prompts
export const AI_PROMPTS = {
  OBJECT_DETECTION: `Analyze this 360° indoor scene image. Identify and list all objects, furniture, equipment, and structural elements. For each object provide: type, location in image (bounding box as % coordinates), confidence level (0-1), and any relevant tags. Return as JSON array.`,
  
  DAMAGE_DETECTION: `Inspect this scene for any damage, hazards, or maintenance issues. Identify: water damage, cracks, broken items, safety violations, fire hazards, blocked exits. Return structured JSON with issue type, severity (low/medium/high/critical), location, and description.`,
  
  SPATIAL_ANALYSIS: `Analyze relationships between objects in this scene. Identify: connected systems (HVAC, electrical), structural dependencies, safety equipment locations, accessibility features. Return JSON with object pairs and relationship types.`,
} as const;

// Helper function to analyze image
export async function analyzeImage(imageBase64: string, prompt: string): Promise<string> {
  try {
    const response = await lmStudioClient.chat.completions.create({
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
  } catch (error) {
    console.error('LM Studio API error:', error);
    throw new Error('AI processing failed. Make sure LM Studio is running with a vision-enabled model.');
  }
}
