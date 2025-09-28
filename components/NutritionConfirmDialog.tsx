import { NutritionData } from '@/types/aiTypes';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface NutritionConfirmDialogProps {
  visible: boolean;
  nutritionData: NutritionData | null;
  transcription?: string;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const NutritionConfirmDialog: React.FC<NutritionConfirmDialogProps> = ({
  visible,
  nutritionData,
  transcription,
  error,
  onConfirm,
  onCancel,
}) => {
  // Animation values
  const modalScale = useSharedValue(0);

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      modalScale.value = 0;
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  // Show the modal for both success and error cases
  const isError = !nutritionData;

  const confidence = nutritionData?.confidence ? Math.round(nutritionData.confidence * 100) : 0;
  const confidenceColor = confidence >= 80 ? '#22C55E' : confidence >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <Animated.View
          style={[modalAnimatedStyle]}
          className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[80%]"
        >
          <Text className="text-xl font-bold text-center mb-4 text-[#8F98FF]">
            {isError ? 'Voice Recognition Error' : 'Confirm Nutrition Data'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Error Display */}
            {isError && (
              <View className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="warning" size={20} color="#EF4444" />
                  <Text className="text-lg font-semibold text-red-600 ml-2">Recognition Failed</Text>
                </View>
                <Text className="text-sm text-red-600">
                  {error || 'Could not process your speech. Please try again.'}
                </Text>
                {transcription && (
                  <View className="mt-3 p-2 bg-white rounded border">
                    <Text className="text-xs font-semibold text-gray-700 mb-1">What I heard:</Text>
                    <Text className="text-xs text-gray-600 italic">"{transcription}"</Text>
                  </View>
                )}
              </View>
            )}
            {/* Success Content */}
            {!isError && (
              <>
                {/* Transcription */}
                {transcription && (
                  <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">What I heard:</Text>
                    <Text className="text-sm text-gray-600 italic">"{transcription}"</Text>
                  </View>
                )}

                {/* Confidence Score */}
                <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-gray-700">AI Confidence:</Text>
                    <View className="flex-row items-center">
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: confidenceColor }}
                      />
                      <Text className="text-sm font-bold" style={{ color: confidenceColor }}>
                        {confidence}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Items Parsed */}
                {nutritionData?.items_parsed && nutritionData.items_parsed.length > 0 && (
                  <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Items recognized:</Text>
                    <Text className="text-sm text-gray-600">
                      {nutritionData.items_parsed.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Nutrition Breakdown */}
                <View className="mb-4">
                  <Text className="text-lg font-semibold mb-3 text-center">Nutrition to Add</Text>

                  {/* Calories */}
                  {nutritionData?.calories && nutritionData.calories > 0 && (
                <View className="flex-row items-center justify-between p-3 bg-[#8F98FF]/10 rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-[#8F98FF] rounded-full mr-3 items-center justify-center">
                      <Text className="text-white text-xs font-bold">C</Text>
                    </View>
                    <Text className="font-semibold">Calories</Text>
                  </View>
                  <Text className="text-lg font-bold text-[#8F98FF]">
                    +{Math.round(nutritionData.calories)}
                  </Text>
                </View>
              )}

                  {/* Protein */}
                  {nutritionData?.protein && nutritionData.protein > 0 && (
                <View className="flex-row items-center justify-between p-3 bg-purple-50 rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="drumstick-bite" size={16} color="#8B5CF6" />
                    <Text className="font-semibold ml-3">Protein</Text>
                  </View>
                  <Text className="text-lg font-bold text-purple-600">
                    +{Math.round(nutritionData.protein)}g
                  </Text>
                </View>
              )}

                  {/* Sugar */}
                  {nutritionData?.sugar && nutritionData.sugar > 0 && (
                <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="cube" size={16} color="#1E40AF" />
                    <Text className="font-semibold ml-3">Sugar</Text>
                  </View>
                  <Text className="text-lg font-bold text-blue-800">
                    +{Math.round(nutritionData.sugar)}g
                  </Text>
                </View>
              )}

                  {/* Caffeine */}
                  {nutritionData?.caffeine && nutritionData.caffeine > 0 && (
                <View className="flex-row items-center justify-between p-3 bg-amber-50 rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="cafe" size={16} color="#8B4513" />
                    <Text className="font-semibold ml-3">Caffeine</Text>
                  </View>
                  <Text className="text-lg font-bold text-amber-700">
                    +{Math.round(nutritionData.caffeine)}mg
                  </Text>
                </View>
              )}

                  {/* Water */}
                  {nutritionData?.water && nutritionData.water > 0 && (
                <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="water" size={16} color="#60A5FA" />
                    <Text className="font-semibold ml-3">Water</Text>
                  </View>
                  <Text className="text-lg font-bold text-blue-500">
                    +{Math.round(nutritionData.water)}oz
                  </Text>
                </View>
                  )}
                </View>

                {/* Low confidence warning */}
                {confidence < 60 && (
                  <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <View className="flex-row items-center">
                      <Ionicons name="warning" size={16} color="#EF4444" />
                      <Text className="text-sm text-red-600 font-semibold ml-2">Low Confidence</Text>
                    </View>
                    <Text className="text-xs text-red-600 mt-1">
                      The AI wasn't very confident about this parsing. Please review the values carefully.
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-200 p-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-700">
                {isError ? 'Close' : 'Cancel'}
              </Text>
            </TouchableOpacity>
            {!isError && (
              <TouchableOpacity
                onPress={onConfirm}
                className="flex-1 bg-[#22C55E] p-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-white">Add to Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};