import { AppContainer } from '@/components/AppContainer';
import { Debug } from '@/components/Debug';
import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import { SettingsPage } from '@/components/Settings';
import { useWeightLoss, WeightLossProvider } from '@/context/WeightLossContext';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

enum Mode {
  Calories = 'calories',
  Weight = 'weight',
}

const HomeScreen = () => {
  const {
    debug,
    setDebug,
    mode,
    setMode,
    value,
    handleValueChange,
    showSettings,
    setShowSettings,
    todaysCalories,
    handleSubmitCalories,
    weightLossGoal,
    setWeightLossGoal,
    calorieHistory,
    handleSubmitWeight,
    weightHistory,
    showCompleteDayDialog,
    twoWeekChange,
    tdee,
    deficit,
    calorieGoal,
    isTodaysWeightLogged,
  } = useWeightLoss();

  useEffect(() => {
    if (isTodaysWeightLogged) {
      setMode(Mode.Calories);
    }
  }, [isTodaysWeightLogged]);

  if (debug) {
    return (
      <Debug
        close={() => setDebug(false)}
        tdee={tdee}
        weightLossGoal={weightLossGoal}
        deficit={deficit}
        todaysCalories={todaysCalories}
        calorieGoal={calorieGoal}
        weightHistory={weightHistory}
        calorieHistory={calorieHistory}
      />
    );
  }

  if (showSettings) {
    return (
      <SettingsPage
        close={() => setShowSettings(false)}
        updateWeightLossGoal={setWeightLossGoal}
        weightLossGoal={weightLossGoal}
      />
    );
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
            className={`flex justify-center items-center flex-1 mr-4 rounded-lg p-4 bg-[#FF7648] h-[55px] flex-row ${isTodaysWeightLogged ? '' : 'shadow-md border-gray-400'}`}
          >
            {!isTodaysWeightLogged && mode !== Mode.Weight && (
              <View className="absolute w-[15px] h-[15px] top-[-5px] right-[-5px] rounded-full border border-gray-400 bg-red-500" />
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
            className="h-[55px] w-[55px] rounded-lg justify-center items-center border-2 border-[#FF7648]"
          >
            <Icon name="settings" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View className="flex rounded-lg p-4 flex-1 justify-center items-center">
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
        {mode === Mode.Calories ? (
          <CaloriesKeyboard onSubmit={handleSubmitCalories} onValueChange={handleValueChange} />
        ) : (
          <WeightKeyboard onSubmit={handleSubmitWeight} onValueChange={handleValueChange} />
        )}
      </View>
      <TouchableOpacity
        disabled={mode !== Mode.Calories}
        onPress={showCompleteDayDialog}
        className="bg-[#4DC591] p-4 justify-center items-center mt-2 rounded-lg h-[55px] w-full shadow-md border-gray-400"
      >
        <Text
          className={`text-white text-lg font-bold text-center ${mode === Mode.Calories ? 'opacity-100' : 'opacity-40'}`}
        >
          Complete Day
        </Text>
      </TouchableOpacity>
    </AppContainer>
  );
};

export default function App() {
  return (
    <WeightLossProvider>
      <HomeScreen />
    </WeightLossProvider>
  );
}
