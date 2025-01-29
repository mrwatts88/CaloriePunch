import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const dateToDashedDateString = (date: Date) => {
  const options = {
    year: 'numeric' as const,
    month: '2-digit' as const,
    day: '2-digit' as const,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const dateString = date.toLocaleDateString('en-CA', options);

  return dateString.replace(/\//g, '-');
};

enum Mode {
  Calories = 'calories',
  Weight = 'weight',
}

const getData = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error(e);
  }
};

const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

type CalorieHistory = {
  calories: number;
  date: string;
};

type WeightHistory = {
  date: string;
  weight: number;
};

const DEFAULT_TODAYS_CALORIES = 0;
const DEFAULT_CALORIE_HISTORY: CalorieHistory[] = [];
const DEFAULT_WEIGHT_HISTORY: WeightHistory[] = [];
const DEFAULT_TDEE = 2500;
const DEFAULT_WEIGHT_LOSS_GOAL = 1.0;

const fillInCalorieHistory = (rawCalorieHistory: CalorieHistory[]) => {
  if (rawCalorieHistory.length == 0) {
    return [];
  }

  const calorieHistory = rawCalorieHistory.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // this should take the history and fill in the gaps with first value after the gap
  // the result should be an array of 30 items
  // It will also forward fill to today using the latest recorded value

  const calorieMap = calorieHistory.reduce(
    (acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    },
    {} as Record<string, CalorieHistory>
  );

  const filledCalorieHistory: CalorieHistory[] = [];
  let mostRecentRecordedDate = calorieHistory.at(-1)!.date;

  for (let i = 0; i < 30; i++) {
    const date = dateToDashedDateString(new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000));

    if (calorieMap[date]) {
      filledCalorieHistory.unshift(calorieMap[date]);
      mostRecentRecordedDate = date;
    } else {
      filledCalorieHistory.unshift({
        ...calorieMap[mostRecentRecordedDate],
        date,
      });
    }
  }

  return filledCalorieHistory;
};

const fillInWeightHistory = (rawWeightHistory: WeightHistory[]) => {
  if (rawWeightHistory.length == 0) {
    return [];
  }

  const weightHistory = rawWeightHistory.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // this should take the history and fill in the gaps with first value after the gap
  // the result should be an array of 30 items
  // It will also forward fill to today using the latest recorded value

  const weightMap = weightHistory.reduce(
    (acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    },
    {} as Record<string, WeightHistory>
  );

  const filledHistory: WeightHistory[] = [];
  let mostRecentRecordedDate = weightHistory.at(-1)!.date;

  for (let i = 0; i < 30; i++) {
    const date = dateToDashedDateString(new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000));

    if (weightMap[date]) {
      filledHistory.unshift(weightMap[date]);
      mostRecentRecordedDate = date;
    } else {
      filledHistory.unshift({
        ...weightMap[mostRecentRecordedDate],
        date,
      });
    }
  }

  return filledHistory;
};

const calculateTwoWeekChange = (weightHistory: WeightHistory[]) => {
  // take the average of the most recent 14 days and compare to the average of the 14 days before that
  // return the difference

  const filledIn = fillInWeightHistory(weightHistory);

  const mostRecent28Days = filledIn.slice(-28);
  const lastTwoWeeks = mostRecent28Days.slice(-14);
  const twoWeeksBefore = mostRecent28Days.slice(0, 14);

  const lastTwoWeeksAvg = lastTwoWeeks.reduce((acc, entry) => acc + entry.weight!, 0) / 14;
  const twoWeeksBeforeAvg = twoWeeksBefore.reduce((acc, entry) => acc + entry.weight!, 0) / 14;

  // round to 1 decimal place
  return Math.round((lastTwoWeeksAvg - twoWeeksBeforeAvg) * 10) / 10;
};

const calculateTdee = (weightHistory: WeightHistory[], calorieHistory: CalorieHistory[]) => {
  if (weightHistory.length < 14 || calorieHistory.length < 14) {
    // if there are not 14 entries in the last 30 days for either weight or calories, return the default TDEE
    // later this default should be calculated based on the user's gender, age, weight, and activity level
    return DEFAULT_TDEE;
  }

  const filledInCalorieHistory = fillInCalorieHistory(calorieHistory);

  // sum the most recent 28 days of calories, not including today
  const mostRecent28DaysNotIncludingToday = filledInCalorieHistory.slice(-29, -1);
  const calories = mostRecent28DaysNotIncludingToday.reduce(
    (acc, entry) => acc + entry.calories,
    0
  );

  const twoWeekChange = calculateTwoWeekChange(weightHistory);
  const totalCaloriesLost = twoWeekChange * 3500;
  const totalCaloriesEaten = calories / 2; // we summed 28 days, so divide by 2 to get 14 day average
  const totalCaloriesBurned = totalCaloriesEaten + totalCaloriesLost;

  return totalCaloriesBurned / 14;
};

const exampleCalorieHistory: CalorieHistory[] = [
  { calories: 2000, date: '2021-09-01' },
  { calories: 2100, date: '2021-09-02' },
  { calories: 2200, date: '2021-09-03' },
  { calories: 2300, date: '2021-09-04' },
  { calories: 2600, date: '2021-09-07' },
  { calories: 2700, date: '2021-09-08' },
  { calories: 2800, date: '2021-09-09' },
  { calories: 2900, date: '2021-09-10' },
  { calories: 3200, date: '2021-09-13' },
  { calories: 3300, date: '2021-09-14' },
  { calories: 3400, date: '2021-09-15' },
  { calories: 3700, date: '2021-09-18' },
  { calories: 3800, date: '2021-09-19' },
  { calories: 3900, date: '2021-09-20' },
  { calories: 4200, date: '2021-09-23' },
  { calories: 4300, date: '2021-09-24' },
  { calories: 4400, date: '2021-09-25' },
  { calories: 4500, date: '2021-09-26' },
  { calories: 4800, date: '2021-09-29' },
  { calories: 4900, date: '2021-09-30' },
  { calories: 5200, date: '2021-10-03' },
  { calories: 5300, date: '2021-10-04' },
  { calories: 1111, date: '2025-01-03' },
  { calories: 3333, date: '2025-01-06' },
  { calories: 2122, date: '2025-01-11' },
];

const exampleWeightHistory: WeightHistory[] = [
  { date: '2021-09-01', weight: 232.4 },
  { date: '2021-09-02', weight: 237.5 },
  { date: '2021-09-03', weight: 237.7 },
  { date: '2021-09-04', weight: 237.4 },
  { date: '2021-09-07', weight: 232.4 },
  { date: '2021-09-08', weight: 232.4 },
  { date: '2021-09-09', weight: 232.4 },
  { date: '2021-09-10', weight: 232.4 },
  { date: '2021-09-13', weight: 232.4 },
  { date: '2021-09-14', weight: 232.4 },
  { date: '2021-09-15', weight: 232.4 },
  { date: '2021-09-18', weight: 232.4 },
  { date: '2021-09-19', weight: 232.4 },
  { date: '2021-09-20', weight: 232.4 },
  { date: '2021-09-23', weight: 232.5 },
  { date: '2021-09-24', weight: 232.5 },
  { date: '2021-09-25', weight: 232.5 },
  { date: '2021-09-26', weight: 237.5 },
  { date: '2021-09-29', weight: 232.5 },
  { date: '2021-09-30', weight: 232.5 },
  { date: '2021-10-04', weight: 232.5 },
  { date: '2021-10-07', weight: 190.5 },
  { date: '2021-10-08', weight: 190.5 },
  { date: '2021-10-09', weight: 190.5 },
  { date: '2025-01-05', weight: 188.5 },
  { date: '2025-01-11', weight: 174.5 },
];

export default function HomeScreen() {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = React.useState(Mode.Calories);
  const [value, setValue] = React.useState('');
  const [todaysCalories, setTodaysCalories] = React.useState(DEFAULT_TODAYS_CALORIES);
  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [weightLossGoal, setWeightLossGoal] = useState(DEFAULT_WEIGHT_LOSS_GOAL);

  const [calorieHistory, setCalorieHistory] =
    React.useState<CalorieHistory[]>(DEFAULT_CALORIE_HISTORY);

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
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ width: '100%' }}>
          <Button
            title="Back"
            onPress={() => {
              setDebug(false);
            }}
          />
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
      </SafeAreaView>
    );
  }

  if (showSettings) {
    return (
      <SafeAreaView style={styles.container}>
        <SettingsPage
          close={() => setShowSettings(false)}
          updateWeightLossGoal={setWeightLossGoal}
          weightLossGoal={weightLossGoal}
        />
      </SafeAreaView>
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

type SettingsPageProps = {
  close: () => void;
  updateWeightLossGoal: (goal: number) => void;
  weightLossGoal: number;
};

const SettingsPage = ({ close, updateWeightLossGoal, weightLossGoal }: SettingsPageProps) => {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 24,
          marginVertical: 10,
        }}
      >
        Settings
      </Text>
      <Text
        style={{
          marginVertical: 10,
        }}
      >
        Weight Loss Goal (lbs/week)
      </Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            updateWeightLossGoal(0.25);
          }}
          style={{
            backgroundColor: weightLossGoal === 0.25 ? 'grey' : 'lightgrey',
            padding: 10,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            width: 50,
            borderRightWidth: 1,
            borderRightColor: 'white',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
            }}
          >
            0.25
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            updateWeightLossGoal(0.5);
          }}
          style={{
            backgroundColor: weightLossGoal === 0.5 ? 'grey' : 'lightgrey',
            padding: 10,
            width: 50,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
            }}
          >
            0.5
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            updateWeightLossGoal(1.0);
          }}
          style={{
            backgroundColor: weightLossGoal === 1.0 ? 'grey' : 'lightgrey',
            padding: 10,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            width: 50,
            borderLeftWidth: 1,
            borderLeftColor: 'white',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
            }}
          >
            1
          </Text>
        </TouchableOpacity>
      </View>
      <Button title="Close" onPress={close} />
    </View>
  );
};
