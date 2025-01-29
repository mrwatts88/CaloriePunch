import { Debug } from '@/components/Debug';
import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import { SettingsPage } from '@/components/Settings';
import {
  calculateTdee,
  calculateTwoWeekChange,
  CalorieHistory,
  dateToDashedDateString,
  DEFAULT_CALORIE_HISTORY,
  DEFAULT_TODAYS_CALORIES,
  DEFAULT_WEIGHT_HISTORY,
  DEFAULT_WEIGHT_LOSS_GOAL,
  getData,
  storeData,
  WeightHistory,
} from '@/utils/calories';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

enum Mode {
  Calories = 'calories',
  Weight = 'weight',
}

export default function HomeScreen() {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState(Mode.Calories);
  const [value, setValue] = useState('');
  const [todaysCalories, setTodaysCalories] = useState(DEFAULT_TODAYS_CALORIES);
  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [weightLossGoal, setWeightLossGoal] = useState(DEFAULT_WEIGHT_LOSS_GOAL);
  const [calorieHistory, setCalorieHistory] = useState<CalorieHistory[]>(DEFAULT_CALORIE_HISTORY);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>(DEFAULT_WEIGHT_HISTORY);

  useEffect(() => {
    const init = async () => {
      const localTodaysCalories = await getData('todaysCalories');
      const localCalorieHistory = await getData('calorieHistory');
      const localWeightHistory = await getData('weightHistory');
      const localWeightLossGoal = await getData('weightLossGoal');

      setTodaysCalories(
        localTodaysCalories ? parseInt(localTodaysCalories) : DEFAULT_TODAYS_CALORIES
      );
      setCalorieHistory(
        localCalorieHistory ? JSON.parse(localCalorieHistory) : DEFAULT_CALORIE_HISTORY
      );
      setWeightHistory(
        localWeightHistory ? JSON.parse(localWeightHistory) : DEFAULT_WEIGHT_HISTORY
      );
      setWeightLossGoal(
        localWeightLossGoal ? parseFloat(localWeightLossGoal) : DEFAULT_WEIGHT_LOSS_GOAL
      );
      setAreLocalStatsLoaded(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!areLocalStatsLoaded) return;

    storeData('todaysCalories', todaysCalories.toString());
    storeData('calorieHistory', JSON.stringify(calorieHistory));
    storeData('weightHistory', JSON.stringify(weightHistory));
    storeData('weightLossGoal', weightLossGoal.toString());
  }, [todaysCalories, calorieHistory, weightHistory, weightLossGoal, areLocalStatsLoaded]);

  const handleSubmitCalories = (calories: string) => {
    setTodaysCalories((prev) => prev + parseInt(calories));
  };

  const handleSubmitWeight = (weight: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const existingToday = weightHistory.find(
      (entry) => entry.date === dateToDashedDateString(new Date())
    );

    let updatedWeightHistory: WeightHistory[] = [];
    if (existingToday) {
      updatedWeightHistory = weightHistory.map((entry) => {
        if (entry.date === dateToDashedDateString(new Date())) {
          return {
            ...entry,
            weight: parseFloat(weight),
          };
        }
        return entry;
      });
    } else {
      updatedWeightHistory = [
        ...weightHistory,
        {
          date: dateToDashedDateString(new Date()),
          weight: parseFloat(weight),
        },
      ];
    }

    setWeightHistory(updatedWeightHistory.slice(-30)); // todo: cut off entries older than 30 days
  };

  const handleValueChange = (changedValue: string) => {
    setValue(changedValue);
  };

  const showCompleteDayDialog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Complete Day', 'Are you sure you want to complete the day?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: handleCompleteDay,
      },
    ]);
  };

  const handleCompleteDay = () => {
    const existingToday = calorieHistory.find(
      (entry) => entry.date === dateToDashedDateString(new Date())
    );

    let updatedCalorieHistory: CalorieHistory[] = [];
    if (existingToday) {
      updatedCalorieHistory = calorieHistory.map((entry) => {
        if (entry.date === dateToDashedDateString(new Date())) {
          return {
            ...entry,
            calories: todaysCalories,
          };
        }
        return entry;
      });
    } else {
      updatedCalorieHistory = [
        ...calorieHistory,
        {
          calories: todaysCalories,
          date: dateToDashedDateString(new Date()),
        },
      ];
    }

    setCalorieHistory(updatedCalorieHistory.slice(-30)); // todo: cut off entries older than 30 days
    setTodaysCalories(0);
  };

  const twoWeekChange = useMemo(() => calculateTwoWeekChange(weightHistory), [weightHistory]);
  const tdee = useMemo(
    () => calculateTdee(weightHistory, calorieHistory),
    [weightHistory, calorieHistory]
  );
  const deficit = useMemo(() => (weightLossGoal * 3500) / 7, [weightLossGoal]);
  const calorieGoal = tdee - deficit;

  const isTodaysWeightLogged = useMemo(
    () => weightHistory.at(-1) && weightHistory.at(-1)!.date === dateToDashedDateString(new Date()),
    [weightHistory]
  );

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
    <SafeAreaView className="flex-1 justify-end items-center mx-5">
      <View className="w-full flex flex-col flex-1 min-h-[200px]">
        <View className="flex flex-row justify-between items-center w-full">
          <TouchableOpacity
            // disabled={isTodaysWeightLogged}
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
        <View className="flex rounded-lg p-4 flex-1 justify-center items-center mb-2">
          <Text className="text-[#8F98FF] text-lg font-bold text-center">Calories Left Today</Text>
          <Text className="text-[#8F98FF] text-6xl font-bold text-center">
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
    </SafeAreaView>
  );
}
