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
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.upperContainer}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
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
            style={[styles.weightBox, isTodaysWeightLogged ? '' : styles.buttonRaised]}
          >
            {!isTodaysWeightLogged && mode !== Mode.Weight && (
              <View
                style={{
                  position: 'absolute',
                  width: 15,
                  height: 15,
                  top: -5,
                  right: -5,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: 'grey',
                  backgroundColor: 'red',
                }}
              />
            )}
            <View>
              {isTodaysWeightLogged ? (
                <>
                  <Text style={styles.upperBoxText2}>2 Wk Weight Change</Text>
                  <Text style={styles.upperBoxText}>
                    {twoWeekChange > 0 ? '+' : ''}
                    {twoWeekChange} lbs
                  </Text>
                </>
              ) : (
                <Text style={styles.upperBoxText}>
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
            style={{
              height: 55,
              width: 55,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#FF7648',
            }}
          >
            <Icon name="settings" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View style={[styles.calorieBox]}>
          <Text style={styles.upperBoxText3}>Calories Left Today</Text>
          {/* <Text style={styles.upperBoxText3}>Calories Left Today</Text> */}
          <Text style={[styles.caloriesLeftText]}>{calorieGoal - todaysCalories}</Text>
        </View>
      </View>
      <View
        style={{
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={[
            styles.numberContainer,
            mode === Mode.Weight ? { backgroundColor: '#FF7648' } : { backgroundColor: '#8F98FF' },
          ]}
        >
          {value ? (
            <Text style={styles.text}>{value}</Text>
          ) : (
            <Text
              style={[
                styles.text,
                {
                  opacity: 0.5,
                },
              ]}
            >
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
        style={styles.completeButton}
      >
        <Text
          style={[
            styles.completeButtonText,
            {
              opacity: mode === Mode.Calories ? 1 : 0.4,
            },
          ]}
        >
          Complete Day
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  upperContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 200,
  },
  calorieBox: {
    display: 'flex',
    borderRadius: 10,
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  weightBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#FF7648',
    height: 55,
    flexDirection: 'row',
  },
  buttonRaised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderColor: 'grey',
  },
  upperBoxText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  caloriesLeftText: {
    color: '#8F98FF',
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  upperBoxText2: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  upperBoxText3: {
    color: '#8F98FF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  numberContainer: {
    display: 'flex',
    padding: 10,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8F98FF',
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#4DC591',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 8,
    height: 55,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderColor: 'grey',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
