export interface NutritionData {
  calories: number;
  protein: number;
  sugar: number;
  caffeine: number;
  water: number;
  confidence?: number;
  items_parsed?: string[];
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  error?: string;
}

export interface AIParseResult {
  success: boolean;
  data?: NutritionData;
  error?: string;
  transcription?: string;
}