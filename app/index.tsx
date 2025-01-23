import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const dateToDashedDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
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
  weight: number;
};

const DEFAULT_DEFICIT = 400;
const DEFAULT_TDEE = 2950;
const DEFAULT_WEIGHT = 0;
const DEFAULT_TODAYS_CALORIES = 0;
const DEFAULT_CALORIE_HISTORY: CalorieHistory[] = [];

const fillInCalorieHistory = (calorieHistory: CalorieHistory[]) => {
  if (calorieHistory.length == 0) {
    return [];
  }

  // this should take the calorie history and fill in the gaps with first value after the gap
  // the result should be an array of 30 items

  // create a map of date to calorie entry
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
    const date = dateToDashedDateString(
      new Date(new Date(calorieHistory.at(-1)!.date).getTime() - i * 24 * 60 * 60 * 1000)
    );

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

const calculateTwoWeekChange = (weightHistory: CalorieHistory[]) => {
  // take the average of the most recent 14 days and compare to the average of the 14 days before that
  // return the difference
  if (weightHistory.length < 28) {
    return 0;
  }

  const mostRecent28Days = weightHistory.slice(-28);
  const lastTwoWeeks = mostRecent28Days.slice(-14);
  const twoWeeksBefore = mostRecent28Days.slice(0, 14);

  const lastTwoWeeksAvg = lastTwoWeeks.reduce((acc, entry) => acc + entry.weight, 0) / 14;
  const twoWeeksBeforeAvg = twoWeeksBefore.reduce((acc, entry) => acc + entry.weight, 0) / 14;

  // round to 1 decimal place
  return Math.round((lastTwoWeeksAvg - twoWeeksBeforeAvg) * 10) / 10;
};

const exampleCalorieHistory: CalorieHistory[] = [
  { calories: 2000, date: '2021-09-01', weight: 232.4 },
  { calories: 2100, date: '2021-09-02', weight: 237.5 },
  { calories: 2200, date: '2021-09-03', weight: 237.7 },
  { calories: 2300, date: '2021-09-04', weight: 237.4 },
  { calories: 2400, date: '2021-09-05', weight: 232.4 },
  { calories: 2500, date: '2021-09-06', weight: 232.4 },
  { calories: 2600, date: '2021-09-07', weight: 232.4 },
  { calories: 2700, date: '2021-09-08', weight: 232.4 },
  { calories: 2800, date: '2021-09-09', weight: 232.4 },
  { calories: 2900, date: '2021-09-10', weight: 232.4 },
  { calories: 3000, date: '2021-09-11', weight: 232.4 },
  { calories: 3100, date: '2021-09-12', weight: 232.4 },
  { calories: 3200, date: '2021-09-13', weight: 232.4 },
  { calories: 3300, date: '2021-09-14', weight: 232.4 },
  { calories: 3400, date: '2021-09-15', weight: 232.4 },
  { calories: 3500, date: '2021-09-16', weight: 190.4 },
  { calories: 3600, date: '2021-09-17', weight: 232.4 },
  { calories: 3700, date: '2021-09-18', weight: 232.4 },
  { calories: 3800, date: '2021-09-19', weight: 232.4 },
  { calories: 3900, date: '2021-09-20', weight: 232.4 },
  { calories: 4000, date: '2021-09-21', weight: 232.5 },
  { calories: 4100, date: '2021-09-22', weight: 232.5 },
  { calories: 4200, date: '2021-09-23', weight: 232.5 },
  { calories: 4300, date: '2021-09-24', weight: 232.5 },
  { calories: 4400, date: '2021-09-25', weight: 232.5 },
  { calories: 4500, date: '2021-09-26', weight: 237.5 },
  { calories: 4600, date: '2021-09-27', weight: 237.5 },
  { calories: 4700, date: '2021-09-28', weight: 237.5 },
  { calories: 4800, date: '2021-09-29', weight: 232.5 },
  { calories: 4900, date: '2021-09-30', weight: 232.5 },
  { calories: 5000, date: '2021-10-01', weight: 232.5 },
  { calories: 5100, date: '2021-10-02', weight: 232.5 },
  { calories: 5200, date: '2021-10-03', weight: 232.5 },
  { calories: 5300, date: '2021-10-04', weight: 232.5 },
  { calories: 5400, date: '2021-10-05', weight: 232.5 },
  { calories: 5500, date: '2021-10-06', weight: 190.5 },
  { calories: 5600, date: '2021-10-07', weight: 190.5 },
  { calories: 5700, date: '2021-10-08', weight: 190.5 },
  { calories: 5800, date: '2021-10-09', weight: 190.5 },
  { calories: 5900, date: '2021-10-10', weight: 190.5 },
  { calories: 6000, date: '2021-10-11', weight: 190.5 },
];

export default function HomeScreen() {
  const [mode, setMode] = React.useState(Mode.Calories);
  const [value, setValue] = React.useState('');
  const [tdee, setTdee] = React.useState(DEFAULT_TDEE);
  const [deficit, setDeficit] = React.useState(DEFAULT_DEFICIT);
  const [todaysCalories, setTodaysCalories] = React.useState(DEFAULT_TODAYS_CALORIES);
  const [weight, setWeight] = React.useState(DEFAULT_WEIGHT);
  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = React.useState(false);

  const [calorieHistory, setCalorieHistory] =
    React.useState<CalorieHistory[]>(DEFAULT_CALORIE_HISTORY);

  const calorieGoal = tdee - deficit;

  useEffect(() => {
    const init = async () => {
      const localTDEE = await getData('tdee');
      const deficit = await getData('deficit');
      const localTodaysCalories = await getData('todaysCalories');
      const localWeight = await getData('weight');
      const localCalorieHistory = await getData('calorieHistory');

      setTdee(localTDEE ? parseInt(localTDEE) : DEFAULT_TDEE);
      setDeficit(deficit ? parseInt(deficit) : DEFAULT_DEFICIT);
      setTodaysCalories(
        localTodaysCalories ? parseInt(localTodaysCalories) : DEFAULT_TODAYS_CALORIES
      );
      setWeight(localWeight ? parseFloat(localWeight) : DEFAULT_WEIGHT);
      setCalorieHistory(
        localCalorieHistory ? JSON.parse(localCalorieHistory) : DEFAULT_CALORIE_HISTORY
      );
      setAreLocalStatsLoaded(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!areLocalStatsLoaded) return;

    storeData('tdee', tdee.toString());
    storeData('deficit', deficit.toString());
    storeData('todaysCalories', todaysCalories.toString());
    storeData('weight', weight.toString());
    storeData('calorieHistory', JSON.stringify(calorieHistory));
  }, [tdee, deficit, todaysCalories, weight, calorieHistory, areLocalStatsLoaded]);

  const handleSubmitCalories = (calories: string) => {
    setTodaysCalories((prev) => prev + parseInt(calories));
  };

  const handleSubmitWeight = (weight: string) => {
    setWeight(parseFloat(weight));
  };

  const handleValueChange = (changedValue: string) => {
    setValue(changedValue);
  };

  const handleCompleteDay = () => {
    // console.log(`Day completed: ${todaysCalories} calories, ${weight} lbs`);
    // console.log(calculateTwoWeekChange(exampleCalorieHistory));
    // console.log(JSON.stringify(fillInCalorieHistory(exampleCalorieHistory), null, 4));
    // AsyncStorage.removeItem('calorieHistory');

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
            weight,
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
          weight,
        },
      ];
    }

    setCalorieHistory(fillInCalorieHistory(updatedCalorieHistory));
    setTodaysCalories(0);
  };

  const twoWeekChange = useMemo(() => calculateTwoWeekChange(calorieHistory), [calorieHistory]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperContainer}>
        <Pressable
          onPress={() => setMode(Mode.Calories)}
          style={[
            styles.calorieBox,
            mode === Mode.Calories ? styles.buttonPressed : styles.buttonRaised,
          ]}
        >
          <View style={styles.upperBoxTextWrapper}>
            <View>
              <Text style={styles.upperBoxText2}>Calories</Text>
              <Text style={[styles.upperBoxText, { marginBottom: 20 }]}>{todaysCalories}</Text>
            </View>
            <View>
              <Text style={styles.upperBoxText2}>Remaining</Text>
              <Text style={[styles.upperBoxText]}>{calorieGoal - todaysCalories}</Text>
            </View>
          </View>
          <View style={styles.upperBoxTextWrapper}>
            <View>
              <Text style={styles.upperBoxText2}>Calorie Goal</Text>
              <Text style={[styles.upperBoxText, { marginBottom: 20 }]}>{calorieGoal}</Text>
            </View>
            <View>
              <Text style={styles.upperBoxText2}>TDEE</Text>
              <Text style={styles.upperBoxText}>{tdee}</Text>
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setMode(Mode.Weight)}
          style={[
            styles.weightBox,
            mode === Mode.Weight ? styles.buttonPressed : styles.buttonRaised,
          ]}
        >
          <View style={styles.upperBoxTextWrapper}>
            <Text style={styles.upperBoxText2}>Weight (lbs)</Text>
            <Text style={[styles.upperBoxText, { marginBottom: 0 }]}>{weight}</Text>
          </View>
          <View style={styles.upperBoxTextWrapper}>
            <Text style={styles.upperBoxText2}>2 Wk Change</Text>
            <Text style={styles.upperBoxText}>{twoWeekChange}</Text>
          </View>
        </Pressable>
      </View>
      <View
        style={[
          styles.numberContainer,
          mode === Mode.Weight ? { backgroundColor: '#FF7648' } : { backgroundColor: '#8F98FF' },
        ]}
      >
        {value && value !== '0.0' ? (
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
            Enter {mode === Mode.Calories ? 'Calories' : 'Weight'}
          </Text>
        )}
      </View>
      {mode === Mode.Calories ? (
        <CaloriesKeyboard onSubmit={handleSubmitCalories} onValueChange={handleValueChange} />
      ) : (
        <WeightKeyboard onSubmit={handleSubmitWeight} onValueChange={handleValueChange} />
      )}
      <TouchableOpacity onPress={handleCompleteDay} style={styles.completeButton}>
        <Text style={styles.completeButtonText}>Complete Day</Text>
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
    justifyContent: 'space-between',
    marginBottom: 'auto',
    paddingTop: 20,
  },
  calorieBox: {
    backgroundColor: '#8F98FF',
    display: 'flex',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
  },
  weightBox: {
    display: 'flex',
    justifyContent: 'center',
    marginVertical: 10,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#FF7648',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    flexDirection: 'row',
  },
  upperBoxTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonPressed: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonRaised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  upperBoxText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  upperBoxText2: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  numberContainer: {
    borderRadius: 10,
    display: 'flex',
    padding: 10,
    marginBottom: 24,
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
    marginTop: 24,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
