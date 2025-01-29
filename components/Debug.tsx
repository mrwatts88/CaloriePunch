import {
  CalorieHistory,
  fillInCalorieHistory,
  fillInWeightHistory,
  WeightHistory,
} from '@/utils/calories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Button, ScrollView, Text } from 'react-native';
import { AppContainer } from './AppContainer';

type DebugProps = {
  close: () => void;
  tdee: number;
  weightLossGoal: number;
  deficit: number;
  todaysCalories: number;
  calorieGoal: number;
  weightHistory: WeightHistory[];
  calorieHistory: CalorieHistory[];
};

export const Debug = ({
  close,
  tdee,
  weightLossGoal,
  deficit,
  todaysCalories,
  calorieGoal,
  weightHistory,
  calorieHistory,
}: DebugProps) => {
  return (
    <AppContainer>
      <ScrollView className="w-full">
        <Button title="Back" onPress={close} />
        <Button
          title="Reset"
          onPress={() => {
            AsyncStorage.clear();
            // setWeightHistory(exampleWeightHistory);
            // setCalorieHistory(exampleCalorieHistory);
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
