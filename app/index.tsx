import { AppContainer } from '@/components/AppContainer';
import { CalorieLog } from '@/components/CalorieLog';
import { Debug } from '@/components/Debug';
import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import { Settings } from '@/components/Settings';
import { Summary } from '@/components/Summary';
import { useWeightLoss } from '@/context/WeightLossContext';
import { Mode } from '@/types/types';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function () {
  const {
    debug,
    setDebug,
    mode,
    setMode,
    value,
    showSettings,
    setShowSettings,
    showCalorieLog,
    setShowCalorieLog,
    showSummary,
    setShowSummary,
    todaysCalories,
    showCompleteDayDialog,
    calorieGoal,
    isTodaysWeightLogged,
  } = useWeightLoss();

  if (debug) {
    return <Debug />;
  }

  if (showSettings) {
    return <Settings />;
  }

  if (showCalorieLog) {
    return <CalorieLog />;
  }

  if (showSummary) {
    return <Summary />;
  }

  return (
    <AppContainer>
      <View className="w-full flex flex-col flex-1 min-h-[200px]">
        <View className="flex flex-row justify-between items-center w-full">
          {!isTodaysWeightLogged && (
            <TouchableOpacity
              onPress={() => {
                if (mode === Mode.Weight) {
                  setMode(Mode.Calories);
                } else {
                  setMode(Mode.Weight);
                }
              }}
              className={`flex justify-center items-center flex-1 rounded-lg p-4 bg-[#FF7648] h-[55px] flex-row shadow-sm border-gray-400`}
            >
              {mode !== Mode.Weight && (
                <View className="absolute w-[15px] h-[15px] top-[-5px] right-[-5px] rounded-full border bg-red-500" />
              )}
              <Text className="text-white text-lg font-bold text-center">
                {mode === Mode.Weight ? (
                  <Ionicons name="arrow-back" size={20} color="white" />
                ) : (
                  <Text>Enter Today's Weight</Text>
                )}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="my-4 border-2 border-[#8F98FF] flex rounded-lg p-4 flex-1 justify-center items-center">
          <Text className="text-[#8F98FF] text-xl mb-1 font-bold text-center">
            Calories Left Today
          </Text>
          <Text className="text-[#8F98FF] text-[120px] font-bold text-center mb-0 h-[100px] leading-none">
            {Math.max(calorieGoal - todaysCalories, 0)}
          </Text>

          <TouchableOpacity
            onLongPress={() => {
              setDebug((prev) => !prev);
            }}
            onPress={() => setShowSettings(true)}
            className="absolute right-0 top-0 p-2"
          >
            <Ionicons name="settings" size={24} color="#8F98FF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCalorieLog(true)}
            className="absolute right-0 bottom-0 p-3"
          >
            <FontAwesome5 name="clipboard-list" size={24} color="#8F98FF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSummary(true)}
            className="absolute left-0 bottom-0 p-3"
          >
            <Ionicons name="stats-chart" size={24} color="#8F98FF" />
          </TouchableOpacity>
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
