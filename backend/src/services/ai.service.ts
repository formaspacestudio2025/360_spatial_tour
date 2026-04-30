import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import db from '../config/database';
import { lmStudioClient, AI_PROMPTS, updateLMStudioConfig, getLMStudioConfig, testLMStudioConnection } from '../config/lmstudio';
import { generateId, parseJSON } from '../utils/helpers';

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

export class AIService {
  /**
   * Process a single scene with AI
   */
  async processScene(sceneId: string): Promise<AIProcessingResult> {
    const startTime = Date.now();
    
    // Get scene from database
    const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId) as any;
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    console.log(`🔄 Processing scene: ${scene.room_name || sceneId}`);

    // Read image file
    const imageBuffer = fs.readFileSync(scene.image_path);
    
    // Split image into segments for better analysis
    const segments = await this.splitImageIntoSegments(imageBuffer);
    
    // Process each segment with LM Studio
    const allTags: AITag[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      console.log(`  Processing segment ${i + 1}/${segments.length}...`);
      
      const segmentBase64 = segments[i].toString('base64');
      
      try {
        // Send to LM Studio for analysis
        const response = await lmStudioClient.chat.completions.create({
          model: getLMStudioConfig().model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: AI_PROMPTS.OBJECT_DETECTION },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${segmentBase64}` },
                },
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        });

        const content = response.choices[0].message.content;
        if (content) {
          // Parse AI response
          const tags = this.parseAIResponse(content, sceneId);
          allTags.push(...tags);
        }
      } catch (error) {
        console.error(`  Error processing segment ${i + 1}:`, error);
      }
    }

    // Save tags to database
    await this.saveAITags(allTags);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Scene processed in ${processingTime}ms - ${allTags.length} tags found`);

    return {
      scene_id: sceneId,
      tags: allTags,
      processing_time: processingTime,
      model_used: getLMStudioConfig().model,
    };
  }

  /**
   * Process all scenes in a walkthrough
   */
  async processWalkthrough(walkthroughId: string): Promise<{ total: number; successful: number; failed: number }> {
    const scenes = db.prepare('SELECT id FROM scenes WHERE walkthrough_id = ?').all(walkthroughId) as any[];
    
    let successful = 0;
    let failed = 0;

    for (const scene of scenes) {
      try {
        await this.processScene(scene.id);
        successful++;
      } catch (error) {
        console.error(`Failed to process scene ${scene.id}:`, error);
        failed++;
      }
    }

    return {
      total: scenes.length,
      successful,
      failed,
    };
  }

  /**
   * Split equirectangular image into segments
   */
  private async splitImageIntoSegments(imageBuffer: Buffer): Promise<Buffer[]> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    const width = metadata.width!;
    const height = metadata.height!;
    
    const segments: Buffer[] = [];
    
    // Split into 6 segments (front, back, left, right, top, bottom approximation)
    const segmentWidth = Math.floor(width / 3);
    const segmentHeight = Math.floor(height / 2);
    
    // Top row
    for (let i = 0; i < 3; i++) {
      const segment = await image
        .extract({
          left: i * segmentWidth,
          top: 0,
          width: segmentWidth,
          height: segmentHeight,
        })
        .resize(512, 512)
        .jpeg({ quality: 85 })
        .toBuffer();
      segments.push(segment);
    }
    
    // Bottom row
    for (let i = 0; i < 3; i++) {
      const segment = await image
        .extract({
          left: i * segmentWidth,
          top: segmentHeight,
          width: segmentWidth,
          height: segmentHeight,
        })
        .resize(512, 512)
        .jpeg({ quality: 85 })
        .toBuffer();
      segments.push(segment);
    }
    
    return segments;
  }

  /**
   * Parse AI response into tags
   */
  private parseAIResponse(response: string, sceneId: string): AITag[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[.*\]/s);
      if (!jsonMatch) {
        return [];
      }

      const objects = JSON.parse(jsonMatch[0]);
      
      return objects.map((obj: any) => ({
        id: generateId(),
        scene_id: sceneId,
        object_type: obj.type || obj.object || 'unknown',
        confidence: Math.min(Math.max(obj.confidence || 0.5, 0), 1),
        bounding_box: obj.bounding_box || obj.location || null,
        tags: obj.tags || [],
        ai_model: getLMStudioConfig().model,
        processed_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  /**
   * Save AI tags to database
   */
  private async saveAITags(tags: AITag[]): Promise<void> {
    const stmt = db.prepare(`
      INSERT INTO ai_tags (id, scene_id, object_type, confidence, bounding_box, tags, ai_model, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((tags: AITag[]) => {
      for (const tag of tags) {
        stmt.run(
          tag.id,
          tag.scene_id,
          tag.object_type,
          tag.confidence,
          tag.bounding_box ? JSON.stringify(tag.bounding_box) : null,
          tag.tags ? JSON.stringify(tag.tags) : null,
          tag.ai_model,
          tag.processed_at
        );
      }
    });

    insertMany(tags);
  }

  /**
   * Get AI tags for a scene
   */
  getTagsByScene(sceneId: string): AITag[] {
    const stmt = db.prepare('SELECT * FROM ai_tags WHERE scene_id = ? ORDER BY confidence DESC');
    const rows = stmt.all(sceneId) as any[];
    return rows.map(row => ({
      ...row,
      bounding_box: row.bounding_box ? JSON.parse(row.bounding_box) : null,
      tags: row.tags ? JSON.parse(row.tags) : [],
    }));
  }

  /**
   * Get all AI tags for a walkthrough
   */
  getTagsByWalkthrough(walkthroughId: string): AITag[] {
    const stmt = db.prepare(`
      SELECT at.*
      FROM ai_tags at
      JOIN scenes s ON at.scene_id = s.id
      WHERE s.walkthrough_id = ?
      ORDER BY at.confidence DESC
    `);
    const rows = stmt.all(walkthroughId) as any[];
    return rows.map(row => ({
      ...row,
      bounding_box: row.bounding_box ? JSON.parse(row.bounding_box) : null,
      tags: row.tags ? JSON.parse(row.tags) : [],
    }));
  }

  /**
   * Update AI tag
   */
  updateTag(tagId: string, updates: Partial<AITag>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.object_type) {
      fields.push('object_type = ?');
      values.push(updates.object_type);
    }
    if (updates.confidence !== undefined) {
      fields.push('confidence = ?');
      values.push(updates.confidence);
    }
    if (updates.tags) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }

    if (fields.length === 0) return false;

    values.push(tagId);

    const stmt = db.prepare(`UPDATE ai_tags SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  /**
   * Delete AI tag
   */
  deleteTag(tagId: string): boolean {
    const stmt = db.prepare('DELETE FROM ai_tags WHERE id = ?');
    const result = stmt.run(tagId);
    return result.changes > 0;
  }

  /**
   * Get LM Studio configuration
   */
  getConfig() {
    return getLMStudioConfig();
  }

  /**
   * Set LM Studio configuration
   */
  setConfig(config: { baseUrl: string; model: string }) {
    updateLMStudioConfig(config);
    return { success: true, config: getLMStudioConfig() };
  }

  /**
   * Test LM Studio connection
   */
  async testConnection() {
    return await testLMStudioConnection();
  }
}

export const aiService = new AIService();
