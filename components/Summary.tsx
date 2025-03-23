import { FullScreenPage } from '@/components/FullScreenPage';
import { Graph } from '@/components/Graph';
import { useWeightLoss } from '@/context/WeightLossContext';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export const Summary = () => {
  const {
    setShowSummary,
    tdee,
    weightLossGoal,
    deficit,
    calorieGoal,
    todaysCalories,
    caloriesLeft,
    weightHistory,
    twoWeekChange,
    resetCalories,
    resetTodaysWeight,
  } = useWeightLoss();

  const confirmClearCalories = () => {
    Alert.alert("Reset Today's Calories", "Are you sure you want to reset today's calories?", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: resetCalories },
    ]);
  };

  const confirmClearWeight = () => {
    Alert.alert("Reset Today's Weight", "Are you sure you want to reset today's weight?", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: resetTodaysWeight },
    ]);
  };

  return (
    <FullScreenPage title="Summary" onClose={() => setShowSummary(false)}>
      <SummaryItem label="Weight Loss Goal" value={`${weightLossGoal} lbs/week`} />
      <SummaryItem label="Calorie Burn" value={`${tdee} Calories/day`} />
      <SummaryItem label="Deficit Goal" value={`${deficit} Calories/day`} />
      <SummaryItem label="Intake Goal" value={`${calorieGoal} Calories/day`} />
      <SummaryItem label="Today's Intake" value={`${todaysCalories} Calories`} />
      <SummaryItem label="Remaining Today" value={`${caloriesLeft} Calories`} />
      <SummaryItem label="Current Weight" value={`${weightHistory.at(-1)?.weight || ''} lbs`} />
      <SummaryItem label="Change in Last 2 Weeks" value={`${twoWeekChange} lbs`} />
      <Graph />
      <TouchableOpacity
        className="bg-[#8F98FF] py-2 rounded-lg items-center justify-center mt-auto"
        onPress={confirmClearCalories}
      >
        <Text className="text-xl text-white">Reset Today's Calories</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-[#4DC591] py-2 rounded-lg items-center justify-center mt-3"
        onPress={confirmClearWeight}
      >
        <Text className="text-xl text-white">Reset Today's Weight</Text>
      </TouchableOpacity>
    </FullScreenPage>
  );
};

const SummaryItem = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <View className="flex flex-row justify-between items-center border-b border-[#4DC591] py-2">
      <Text className="text-xl">{label}</Text>
      <Text className="text-xl">{value}</Text>
    </View>
  );
};
