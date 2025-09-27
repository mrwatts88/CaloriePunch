import { useWeightLoss } from '@/context/WeightLossContext';
import { dateToDashedDateString } from '@/utils/calories';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const THRESHOLDS = {
  water: 64,
  sugar: 60,
  protein: 100,
  caffeine: 200,
};

const SUCCESS_COLOR = '#22C55E';
const WARNING_COLOR = '#EF4444';

interface CompleteDayDialogProps {
  visible: boolean;
  onClose: () => void;
  onCompleteToday: () => void;
  onCompleteYesterday: () => void;
}

export const CompleteDayDialog: React.FC<CompleteDayDialogProps> = ({
  visible,
  onClose,
  onCompleteToday,
  onCompleteYesterday,
}) => {
  const {
    todaysCalories,
    calorieGoal,
    todaysSugar,
    todaysWater,
    todaysProtein,
    todaysCaffeine,
    weightHistory,
    twoWeekChange,
  } = useWeightLoss();

  // Animation values
  const modalScale = useSharedValue(0);
  const celebrationScale = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  const todaysWeight = weightHistory.find(
    entry => entry.date === dateToDashedDateString(new Date())
  )?.weight;

  const getGoalStatus = (tracker: string, value: number) => {
    if (tracker === 'water' && value >= THRESHOLDS.water) return true;
    if (tracker === 'protein' && value >= THRESHOLDS.protein) return true;
    if (tracker === 'sugar' && value <= THRESHOLDS.sugar) return true;
    if (tracker === 'caffeine' && value <= THRESHOLDS.caffeine) return true;
    return false;
  };

  const goalsAchieved = [
    getGoalStatus('water', todaysWater),
    getGoalStatus('protein', todaysProtein),
    getGoalStatus('sugar', todaysSugar),
    getGoalStatus('caffeine', todaysCaffeine),
  ].filter(Boolean).length;

  const isAllGoalsAchieved = goalsAchieved === 4;
  const isUnderCalorieGoal = todaysCalories <= Math.round(calorieGoal); // At or under calorie goal
  const isPerfectDay = isAllGoalsAchieved && isUnderCalorieGoal;

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });

      if (isPerfectDay) {
        // Celebration animation for perfect days
        celebrationScale.value = withDelay(
          300,
          withSequence(
            withSpring(1.2, { damping: 10 }),
            withSpring(1, { damping: 8 })
          )
        );
        confettiOpacity.value = withDelay(
          400,
          withSequence(
            withTiming(1, { duration: 300 }),
            withDelay(1000, withTiming(0, { duration: 500 }))
          )
        );
      }
    } else {
      modalScale.value = 0;
      celebrationScale.value = 0;
      confettiOpacity.value = 0;
    }
  }, [visible, isPerfectDay]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        {/* Confetti Effect for Perfect Days */}
        {isPerfectDay && (
          <Animated.View
            style={[confettiAnimatedStyle]}
            className="absolute inset-0 pointer-events-none"
          >
            <View className="flex-1 justify-center items-center">
              <Text className="text-6xl animate-bounce">🎉</Text>
              <Text className="text-4xl absolute top-20 left-10 animate-pulse">⭐</Text>
              <Text className="text-4xl absolute top-32 right-16 animate-bounce">🏆</Text>
              <Text className="text-3xl absolute bottom-40 left-20 animate-pulse">✨</Text>
              <Text className="text-3xl absolute bottom-32 right-12 animate-bounce">🎊</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View
          style={[modalAnimatedStyle]}
          className="bg-white rounded-xl p-6 w-full max-w-sm"
        >
          <Animated.View style={[celebrationAnimatedStyle]}>
            <Text className={`text-xl font-bold text-center mb-4 ${
              isPerfectDay ? 'text-green-600' : ''
            }`}>
              {isPerfectDay ? '🎉 Perfect Day! 🎉' : 'Complete Day'}
            </Text>
            {isPerfectDay && (
              <Text className="text-sm text-green-600 text-center mb-2 font-semibold">
                All goals achieved! Outstanding! ⭐
              </Text>
            )}
          </Animated.View>

          {/* Calorie Summary */}
          <View className="mb-4 p-4 bg-gray-50 rounded-lg">
            <Text className="text-lg font-semibold mb-2">Calories</Text>
            <Text className="text-2xl font-bold text-[#8F98FF]">
              {todaysCalories} / {Math.round(calorieGoal)}
            </Text>
            <Text className="text-sm text-gray-600">
              {todaysCalories > calorieGoal ? 'Over goal' : 'Under goal'} by {Math.abs(todaysCalories - Math.round(calorieGoal))}
            </Text>
          </View>

          {/* Weight Summary */}
          {todaysWeight && (
            <View className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Text className="text-lg font-semibold mb-2">Weight</Text>
              <Text className="text-2xl font-bold text-[#FF7648]">{todaysWeight} lbs</Text>
              <Text className="text-sm text-gray-600">
                2-week change: {twoWeekChange} lbs
              </Text>
            </View>
          )}

          {/* Goals Summary */}
          <View className="mb-6 p-4 bg-gray-50 rounded-lg">
            <Text className="text-lg font-semibold mb-3">Daily Goals ({goalsAchieved}/4)</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Ionicons
                  name="water"
                  size={20}
                  color={getGoalStatus('water', todaysWater) ? SUCCESS_COLOR : '#gray'}
                />
                <Text className="text-xs mt-1">{todaysWater}/{THRESHOLDS.water}oz</Text>
              </View>
              <View className="items-center">
                <FontAwesome5
                  name="drumstick-bite"
                  size={18}
                  color={getGoalStatus('protein', todaysProtein) ? SUCCESS_COLOR : '#gray'}
                />
                <Text className="text-xs mt-1">{todaysProtein}/{THRESHOLDS.protein}g</Text>
              </View>
              <View className="items-center">
                <FontAwesome5
                  name="cube"
                  size={18}
                  color={getGoalStatus('sugar', todaysSugar) ? SUCCESS_COLOR : WARNING_COLOR}
                />
                <Text className="text-xs mt-1">{todaysSugar}/{THRESHOLDS.sugar}g</Text>
              </View>
              <View className="items-center">
                <Ionicons
                  name="cafe"
                  size={18}
                  color={getGoalStatus('caffeine', todaysCaffeine) ? SUCCESS_COLOR : WARNING_COLOR}
                />
                <Text className="text-xs mt-1">{todaysCaffeine}/{THRESHOLDS.caffeine}mg</Text>
              </View>
            </View>
          </View>

          <Text className="text-center text-gray-600 mb-4">
            Is this calorie total for yesterday or today?
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-200 p-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCompleteYesterday}
              className="flex-1 bg-[#8F98FF] p-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">Yesterday</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCompleteToday}
              className="flex-1 bg-[#4DC591] p-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">Today</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};