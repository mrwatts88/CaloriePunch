import { useWeightLoss } from '@/context/WeightLossContext';
import { fillInCalorieHistory, fillInWeightHistory } from '@/utils/calories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Button, ScrollView, Text } from 'react-native';
import { AppContainer } from './AppContainer';

export const Debug = () => {
  const {
    todaysCalories,
    weightLossGoal,
    calorieHistory,
    weightHistory,
    tdee,
    deficit,
    calorieGoal,
    setDebug,
  } = useWeightLoss();
  return (
    <AppContainer>
      <ScrollView className="w-full">
        <Button title="Back" onPress={() => setDebug(false)} />
        <Button
          title="Reset"
          onPress={() => {
            AsyncStorage.clear();
          }}
        />
        <Text className="font-bold">TDEE: {tdee} cals/day</Text>
        <Text className="font-bold">Weight Loss Goal: {weightLossGoal} lbs/wk</Text>
        <Text className="font-bold">Deficit: {deficit} cals/day</Text>
        <Text className="font-bold">Goal: {tdee - deficit} cals/day</Text>
        <Text className="font-bold">Today Cals: {todaysCalories}</Text>
        <Text className="font-bold">Calories Left: {calorieGoal - todaysCalories}</Text>
        <Text className="font-bold mt-4">Weight History:</Text>
        {weightHistory.map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
        <Text className="font-bold mt-4">Filled in Weight History:</Text>
        {fillInWeightHistory(weightHistory).map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
        <Text className="font-bold mt-4">Calorie History:</Text>
        {calorieHistory.map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
        <Text className="font-bold mt-4">Filled in Calorie History:</Text>
        {fillInCalorieHistory(calorieHistory).map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
      </ScrollView>
    </AppContainer>
  );
};
