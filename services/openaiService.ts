import Constants from 'expo-constants';
import { AIParseResult, NutritionData } from '@/types/aiTypes';
import OpenAI from 'openai';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    // Get API key from expo config or environment
    const apiKey = Constants.expoConfig?.extra?.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * Convert speech to text using Whisper
   */
  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      // Fetch the audio file directly from the URI
      const response = await fetch(audioUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Determine file extension from URI or default to m4a
      const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';

      // Map extensions to MIME types that OpenAI expects
      const mimeTypeMap: Record<string, string> = {
        'm4a': 'audio/m4a',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'mp4': 'audio/mp4',
        'ogg': 'audio/ogg',
        'webm': 'audio/webm',
        'flac': 'audio/flac',
      };

      const mimeType = mimeTypeMap[extension] || 'audio/m4a';
      const filename = `audio.${extension}`;

      // Create a File object with correct MIME type
      const file = new File([blob], filename, { type: mimeType });

      console.log(`Transcribing audio file: ${filename} (${mimeType}), size: ${blob.size} bytes`);

      const transcription = await this.client.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'en',
      });

      return transcription.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);

      // Log more details for debugging
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }

      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Parse nutrition data from text using Structured Outputs
   */
  async parseNutritionData(text: string): Promise<NutritionData> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert. Parse food and drink descriptions to extract nutritional data.

Instructions:
- Extract total calories, protein (grams), sugar (grams), caffeine (mg), and water (fl oz)
- For water, only count actual water/beverages consumed, not water content in food
- Be conservative with estimates - if unsure, use lower values
- For caffeine: coffee ~95mg/cup, tea ~25-50mg/cup, soda ~35mg/12oz
- Provide confidence score 0-1 (1 = very confident, 0.5 = moderate estimate)
- List all food/drink items you identified

Examples:
- "I had 2 slices of pizza and a coke" → calories: 800, protein: 30, sugar: 35, caffeine: 35, water: 0
- "Drank a large coffee and ate an apple" → calories: 85, protein: 1, sugar: 20, caffeine: 95, water: 0
- "Had a protein shake and a bottle of water" → calories: 150, protein: 25, sugar: 3, caffeine: 0, water: 16`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'nutrition_data',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                calories: {
                  type: 'number',
                  description: 'Total calories consumed',
                },
                protein: {
                  type: 'number',
                  description: 'Total protein in grams',
                },
                sugar: {
                  type: 'number',
                  description: 'Total sugar in grams',
                },
                caffeine: {
                  type: 'number',
                  description: 'Total caffeine in milligrams',
                },
                water: {
                  type: 'number',
                  description: 'Total water/beverages in fluid ounces',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score from 0 to 1',
                },
                items_parsed: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of food/drink items identified',
                },
              },
              required: ['calories', 'protein', 'sugar', 'caffeine', 'water', 'confidence', 'items_parsed'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const nutritionData: NutritionData = JSON.parse(content);

      // Validate the response
      if (typeof nutritionData.calories !== 'number' ||
          typeof nutritionData.protein !== 'number' ||
          typeof nutritionData.sugar !== 'number' ||
          typeof nutritionData.caffeine !== 'number' ||
          typeof nutritionData.water !== 'number') {
        throw new Error('Invalid nutrition data format');
      }

      return nutritionData;
    } catch (error) {
      console.error('Error parsing nutrition data:', error);
      throw new Error('Failed to parse nutrition data');
    }
  }

  /**
   * Complete voice-to-nutrition pipeline
   */
  async processVoiceInput(audioUri: string): Promise<AIParseResult> {
    try {
      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(audioUri);

      if (!transcription.trim()) {
        return {
          success: false,
          error: 'No speech detected in audio',
          transcription,
        };
      }

      // Step 2: Parse nutrition data
      const nutritionData = await this.parseNutritionData(transcription);

      return {
        success: true,
        data: nutritionData,
        transcription,
      };
    } catch (error) {
      console.error('Error processing voice input:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();