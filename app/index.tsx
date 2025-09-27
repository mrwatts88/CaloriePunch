import { AppContainer } from '@/components/AppContainer';
import { CalorieLog } from '@/components/CalorieLog';
import { CompleteDayDialog } from '@/components/CompleteDayDialog';
import { Debug } from '@/components/Debug';
import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import { Settings } from '@/components/Settings';
import { Summary } from '@/components/Summary';
import { useWeightLoss } from '@/context/WeightLossContext';
import { Mode } from '@/types/types';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const THRESHOLDS = {
  water: 64,
  sugar: 60,
  protein: 100,
  caffeine: 200,
};

const DEFAULT_COLORS = {
  water: '#60A5FA',
  sugar: '#1E40AF',
  protein: '#8B5CF6',
  caffeine: '#8B4513',
};

const SUCCESS_COLOR = '#22C55E';
const WARNING_COLOR = '#EF4444';

const getTrackerColor = (tracker: string, value: number) => {
  if (
    (tracker === 'water' && value >= THRESHOLDS.water) ||
    (tracker === 'protein' && value >= THRESHOLDS.protein)
  ) {
    return SUCCESS_COLOR;
  }
  if (
    (tracker === 'sugar' && value >= THRESHOLDS.sugar) ||
    (tracker === 'caffeine' && value >= THRESHOLDS.caffeine)
  ) {
    return WARNING_COLOR;
  }
  return DEFAULT_COLORS[tracker as keyof typeof DEFAULT_COLORS];
};

export default function () {
  const [showCaloriesLeft, setShowCaloriesLeft] = useState(true);

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
    showCompleteDayModal,
    setShowCompleteDayModal,
    showCompleteDayDialog,
    handleCompleteDay,
    caloriesLeft,
    todaysCalories,
    todaysSugar,
    todaysWater,
    todaysProtein,
    todaysCaffeine,
    addSugar,
    addWater,
    addProtein,
    addCaffeine,
    subtractSugar,
    subtractWater,
    subtractProtein,
    subtractCaffeine,
    isTodaysWeightLogged,
    weightHistory,
    calorieHistory,
    gender,
    activityLevel,
    age,
    height,
  } = useWeightLoss();

  const missingSettingsData = !gender || !activityLevel || !age || !height;
  const missingEntries = weightHistory.length < 14 || calorieHistory.length < 14;

  const showTdeeWarning = () => {
    let title, message;

    if (missingSettingsData && missingEntries) {
      title = 'Missing Info';
      message = 'Go to settings and fill in all the fields to get a more accurate calorie goal.';
      Alert.alert(title, message, [
        { text: 'Go to Settings', onPress: () => setShowSettings(true) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else if (missingEntries) {
      title = 'Keep Logging Daily!';
      message = 'You need more weight and calorie entries to get the most accurate calorie goal.';
      Alert.alert(title, message, [{ text: 'Got it' }]);
    } else {
      title = 'Keep Up The Good Work!';
      message = "You're getting a personalized calorie goal based on your daily logs.";
      Alert.alert(title, message, [{ text: 'Got it' }]);
    }
  };

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
          <TouchableOpacity
            onPress={() => setShowCaloriesLeft(!showCaloriesLeft)}
            className="justify-center items-center"
          >
            <Text className="text-[#8F98FF] text-xl mb-1 font-bold text-center">
              {showCaloriesLeft ? 'Calories Left Today' : "Today's Calories"}
            </Text>
            <Text className="text-[#8F98FF] text-[100px] font-bold text-center mb-0 h-[80px] leading-none">
              {showCaloriesLeft ? caloriesLeft : todaysCalories}
            </Text>
          </TouchableOpacity>
          <View className="absolute top-0 left-0 right-0 flex flex-row justify-between items-start p-2">
            <TouchableOpacity onPress={showTdeeWarning}>
              <Ionicons
                name="information-circle"
                size={24}
                color={missingEntries ? '#EF4444' : '#8F98FF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSummary(true)}
            >
              <Ionicons name="stats-chart" size={24} color="#8F98FF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCalorieLog(true)}
            >
              <FontAwesome5 name="clipboard-list" size={24} color="#8F98FF" />
            </TouchableOpacity>
            <TouchableOpacity
              onLongPress={() => {
                setDebug((prev) => !prev);
              }}
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings" size={24} color="#8F98FF" />
            </TouchableOpacity>
          </View>
          <View className="absolute bottom-0 left-0 right-0 flex flex-row justify-between items-center p-2">
            <TouchableOpacity
              onPress={addWater}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                subtractWater();
              }}
              className="flex-col items-center"
            >
              <Ionicons name="water" size={18} color={getTrackerColor('water', todaysWater)} />
              <Text className={`text-xs font-bold`}>
                <Text style={{ color: getTrackerColor('water', todaysWater) }}>
                  {todaysWater}/
                </Text>
                <Text style={{ color: SUCCESS_COLOR }}>
                  {THRESHOLDS.water}oz
                </Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addProtein}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                subtractProtein();
              }}
              className="flex-col items-center"
            >
              <FontAwesome5
                name="drumstick-bite"
                size={16}
                color={getTrackerColor('protein', todaysProtein)}
              />
              <Text className={`text-xs font-bold`}>
                <Text style={{ color: getTrackerColor('protein', todaysProtein) }}>
                  {todaysProtein}/
                </Text>
                <Text style={{ color: SUCCESS_COLOR }}>
                  {THRESHOLDS.protein}g
                </Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addSugar}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                subtractSugar();
              }}
              className="flex-col items-center"
            >
              <FontAwesome5 name="cube" size={16} color={getTrackerColor('sugar', todaysSugar)} />
              <Text className={`text-xs font-bold`}>
                <Text style={{ color: getTrackerColor('sugar', todaysSugar) }}>
                  {todaysSugar}/
                </Text>
                <Text style={{ color: WARNING_COLOR }}>
                  {THRESHOLDS.sugar}g
                </Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addCaffeine}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                subtractCaffeine();
              }}
              className="flex-col items-center"
            >
              <Ionicons name="cafe" size={16} color={getTrackerColor('caffeine', todaysCaffeine)} />
              <Text className={`text-xs font-bold`}>
                <Text style={{ color: getTrackerColor('caffeine', todaysCaffeine) }}>
                  {todaysCaffeine}/
                </Text>
                <Text style={{ color: WARNING_COLOR }}>
                  {THRESHOLDS.caffeine}mg
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
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
      <CompleteDayDialog
        visible={showCompleteDayModal}
        onClose={() => setShowCompleteDayModal(false)}
        onCompleteToday={() => {
          handleCompleteDay(false);
          setShowCompleteDayModal(false);
        }}
        onCompleteYesterday={() => {
          handleCompleteDay(true);
          setShowCompleteDayModal(false);
        }}
      />
    </AppContainer>
  );
}
