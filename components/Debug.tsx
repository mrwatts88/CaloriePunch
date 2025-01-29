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
      <ScrollView style={{ width: '100%' }}>
        <Button title="Back" onPress={close} />
        <Button
          title="Reset"
          onPress={() => {
            AsyncStorage.clear();
            // setWeightHistory(exampleWeightHistory);
            // setCalorieHistory(exampleCalorieHistory);
          }}
        />
        <Text>TDEE: {tdee} cals/day</Text>
        <Text>Weight Loss Goal: {weightLossGoal} lbs/wk</Text>
        <Text>Deficit: {deficit} cals/day</Text>
        <Text>Goal: {tdee - deficit} cals/day</Text>
        <Text>Today Cals: {todaysCalories}</Text>
        <Text>Calories Left: {calorieGoal - todaysCalories}</Text>
        <Text />
        <Text style={{ fontWeight: 'bold' }}>Weight History:</Text>
        {weightHistory.map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
        <Text />
        <Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Filled in Weight History:
        </Text>
        {fillInWeightHistory(weightHistory).map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
        <Text />
        <Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Calorie History:
        </Text>
        {calorieHistory.map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
        <Text />
        <Text
          style={{
            fontWeight: 'bold',
          }}
        >
          Filled in Calorie History:
        </Text>
        {fillInCalorieHistory(calorieHistory).map((ch) => {
          return <Text key={ch.date}>{JSON.stringify(ch)}</Text>;
        })}
      </ScrollView>
    </AppContainer>
  );
};
