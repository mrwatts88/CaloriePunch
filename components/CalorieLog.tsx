import { FullScreenPage } from '@/components/FullScreenPage';
import { useWeightLoss } from '@/context/WeightLossContext';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const CalorieLog = () => {
  const { setShowCalorieLog, todaysCalorieEntries, removeCalorieEntry } = useWeightLoss();

  const showAreYouSureDeleteDialog = (idx: number) => {
    Alert.alert('Are you sure you want to delete this entry?', '', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeCalorieEntry(idx);
        },
      },
    ]);
  };

  return (
    <FullScreenPage title="Calorie Log" onClose={() => setShowCalorieLog(false)}>
      <ScrollView className="mx-0 flex-1">
        {todaysCalorieEntries.length === 0 && (
          <Text className="text-xl text-center">No entries yet today</Text>
        )}
        {todaysCalorieEntries.map((entry, idx) => (
          <View
            key={idx}
            className="flex flex-row justify-between items-center border-b border-[#4DC591] py-2"
          >
            <Text className="text-xl">{entry} Calories</Text>
            <TouchableOpacity onPress={() => showAreYouSureDeleteDialog(idx)}>
              <Text className="text-xl text-red-500">Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </FullScreenPage>
  );
};
