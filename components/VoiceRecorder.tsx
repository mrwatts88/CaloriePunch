import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { openaiService } from '@/services/openaiService';
import { AIParseResult } from '@/types/aiTypes';

interface VoiceRecorderProps {
  onNutritionParsed: (result: AIParseResult) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onNutritionParsed, disabled = false, compact = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  // Speech recognition event handlers
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech recognition started');
    setIsRecording(true);
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech recognition ended');
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    console.log('Speech recognition result:', event.results);
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setRecognizedText(transcript);
      // Process the final result
      if (event.isFinal) {
        processTranscription(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsRecording(false);
    setIsProcessing(false);

    // Handle different error types
    if (event.error === 'no-speech') {
      onNutritionParsed({
        success: false,
        error: 'No speech detected. Please try speaking again.',
      });
    } else {
      onNutritionParsed({
        success: false,
        error: 'Failed to recognize speech. Please try again.',
      });
    }
  });

  const startSpeechRecognition = async () => {
    try {
      setRecognizedText('');
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        contextualStrings: ['calories', 'protein', 'sugar', 'caffeine', 'water', 'ounces', 'grams'],
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onNutritionParsed({
        success: false,
        error: 'Failed to start speech recognition. Please try again.',
      });
    }
  };

  const stopSpeechRecognition = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  };

  const processTranscription = async (transcript: string) => {
    if (!transcript.trim()) {
      onNutritionParsed({
        success: false,
        error: 'No speech detected. Please try speaking again.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const nutritionData = await openaiService.parseNutritionData(transcript);
      setIsProcessing(false);

      // Check if any nutrition data was found
      const hasNutritionData = nutritionData.calories > 0 ||
                               nutritionData.protein > 0 ||
                               nutritionData.sugar > 0 ||
                               nutritionData.caffeine > 0 ||
                               nutritionData.water > 0;

      if (!hasNutritionData) {
        onNutritionParsed({
          success: false,
          error: 'No nutrition information found in your speech. Try mentioning calories, protein, sugar, caffeine, or water.',
          transcription: transcript,
        });
        return;
      }

      onNutritionParsed({
        success: true,
        data: nutritionData,
        transcription: transcript,
      });
    } catch (error) {
      console.error('Failed to parse nutrition data:', error);
      setIsProcessing(false);
      onNutritionParsed({
        success: false,
        error: 'Failed to process your speech. Please try again.',
        transcription: transcript,
      });
    }
  };

  const getButtonColor = (): string => {
    if (disabled) return '#9CA3AF';
    if (isRecording) return '#EF4444';
    if (isProcessing) return '#F59E0B';
    return '#22C55E';
  };

  const getButtonText = (): string => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Listening...';
    return 'Tap to Speak Food';
  };

  const getIcon = () => {
    const iconSize = compact ? 24 : 24;
    const iconColor = 'white';

    if (isProcessing) {
      return <ActivityIndicator color="white" size="small" />;
    }
    if (isRecording) {
      return <Ionicons name="stop" size={iconSize} color={iconColor} />;
    }
    return <Ionicons name="mic" size={iconSize} color={iconColor} />;
  };

  const handlePress = async () => {
    if (disabled || isProcessing) return;

    if (isRecording) {
      await stopSpeechRecognition();
    } else {
      await startSpeechRecognition();
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || isProcessing}
        className="w-12 justify-center items-center rounded-lg h-full"
        style={{ backgroundColor: getButtonColor() }}
      >
        {getIcon()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isProcessing}
      className="flex-row items-center justify-center p-4 rounded-lg shadow-sm border-gray-400"
      style={{ backgroundColor: getButtonColor() }}
    >
      <View className="mr-3">
        {getIcon()}
      </View>
      <Text className="text-white text-lg font-bold">
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};