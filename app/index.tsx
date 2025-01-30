import { AppContainer } from '@/components/AppContainer';
import { Debug } from '@/components/Debug';
import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import { Settings } from '@/components/Settings';
import { Mode, useWeightLoss } from '@/context/WeightLossContext';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function () {
  const {
    debug,
    setDebug,
    mode,
    setMode,
    value,
    showSettings,
    setShowSettings,
    todaysCalories,
    showCompleteDayDialog,
    twoWeekChange,
    calorieGoal,
    isTodaysWeightLogged,
  } = useWeightLoss();

  if (debug) {
    return <Debug />;
  }

  if (showSettings) {
    return <Settings />;
  }

  return (
    <AppContainer>
      <View className="w-full flex flex-col flex-1 min-h-[200px]">
        <View className="flex flex-row justify-between items-center w-full">
          <TouchableOpacity
            disabled={isTodaysWeightLogged}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (mode === Mode.Weight) {
                setMode(Mode.Calories);
              } else {
                setMode(Mode.Weight);
              }
            }}
            className={`flex justify-center items-center flex-1 mr-4 rounded-lg p-4 bg-[#FF7648] h-[55px] flex-row ${isTodaysWeightLogged ? '' : 'shadow-sm border-gray-400'}`}
          >
            {!isTodaysWeightLogged && mode !== Mode.Weight && (
              <View className="absolute w-[15px] h-[15px] top-[-5px] right-[-5px] rounded-full border bg-red-500" />
            )}
            <View>
              {isTodaysWeightLogged ? (
                <>
                  <Text className="text-white text-lg font-bold text-center">
                    2 Wk Weight Change
                  </Text>
                  <Text className="text-white text-lg font-bold text-center">
                    {twoWeekChange > 0 ? '+' : ''}
                    {twoWeekChange} lbs
                  </Text>
                </>
              ) : (
                <Text className="text-white text-lg font-bold text-center">
                  {mode === Mode.Weight ? (
                    <Icon name="arrow-back" size={20} color="white" />
                  ) : (
                    <Text>Enter Today's Weight</Text>
                  )}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onLongPress={() => {
              setDebug((prev) => !prev);
            }}
            onPress={() => {
              setShowSettings(true);
            }}
            className="shadow-sm bg-[#FFF8DC] h-[55px] w-[55px] rounded-lg justify-center items-center border-2 border-[#4DC591]"
          >
            <Icon name="settings" size={30} color="#4DC591" />
          </TouchableOpacity>
        </View>
        <View className="my-4 border-2 border-[#8F98FF] flex rounded-lg p-4 flex-1 justify-center items-center">
          <Text className="text-[#8F98FF] text-xl mb-1 font-bold text-center">
            Calories Left Today
          </Text>
          <Text className="text-[#8F98FF] text-9xl font-bold text-center">
            {calorieGoal - todaysCalories}
          </Text>
        </View>
      </View>
      <View className="rounded-lg justify-center items-center overflow-hidden w-full">
        <View
          className={`h-[60px] flex p-2 mb-[2px] justify-center items-center w-full ${mode === Mode.Weight ? 'bg-[#FF7648]' : 'bg-[#8F98FF]'}`}
        >
          {value ? (
            <Text className="text-white text-4xl font-bold">{value}</Text>
          ) : (
            <Text className="text-white text-4xl font-bold opacity-50">
              {mode === Mode.Calories ? 'Calories' : 'Weight'}
            </Text>
          )}
        </View>
        {mode === Mode.Calories ? <CaloriesKeyboard /> : <WeightKeyboard />}
      </View>
      <TouchableOpacity
        disabled={mode !== Mode.Calories}
        onPress={showCompleteDayDialog}
        className="bg-[#4DC591] p-4 justify-center items-center mt-4 rounded-lg h-[55px] w-full shadow-sm border-gray-400"
      >
        <Text
          className={`text-white text-lg font-bold text-center ${mode === Mode.Calories ? 'opacity-100' : 'opacity-40'}`}
        >
          Complete Day
        </Text>
      </TouchableOpacity>
    </AppContainer>
  );
}
