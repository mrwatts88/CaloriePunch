import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AppContainer } from './AppContainer';

type SettingsPageProps = {
  close: () => void;
  updateWeightLossGoal: (goal: number) => void;
  weightLossGoal: number;
};

export const SettingsPage = ({
  close,
  updateWeightLossGoal,
  weightLossGoal,
}: SettingsPageProps) => {
  return (
    <AppContainer>
      <View className="flex-1 items-center mx-5">
        <Text className="text-2xl font-bold my-2">Settings</Text>
        <Text className="my-2">Weight Loss Goal (lbs/week)</Text>
        <View className="flex-row mb-2">
          <TouchableOpacity
            onPress={() => {
              updateWeightLossGoal(0.25);
            }}
            className={`w-[50px] p-2 rounded-l-lg border-r border-white ${
              weightLossGoal === 0.25 ? 'bg-gray-400' : 'bg-gray-200'
            }`}
          >
            <Text className="text-center">0.25</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              updateWeightLossGoal(0.5);
            }}
            className={`p-2 w-[50px] ${weightLossGoal === 0.5 ? 'bg-gray-400' : 'bg-gray-200'}`}
          >
            <Text className="text-center">0.5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              updateWeightLossGoal(1.0);
            }}
            className={`p-2 w-[50px] rounded-r-lg border-l border-white ${
              weightLossGoal === 1.0 ? 'bg-gray-400' : 'bg-gray-200'
            }`}
          >
            <Text className="text-center">1</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={close}
          className="bg-[#4DC591] p-4 justify-center items-center mt-2 rounded-lg h-[55px] w-full shadow-md border-gray-400"
        >
          <Text className="text-white text-lg font-bold text-center">Close</Text>
        </TouchableOpacity>
      </View>
    </AppContainer>
  );
};
