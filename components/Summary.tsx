import { FullScreenPage } from '@/components/FullScreenPage';
import { useWeightLoss } from '@/context/WeightLossContext';
import React from 'react';
import { Text, View } from 'react-native';

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
  } = useWeightLoss();

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
