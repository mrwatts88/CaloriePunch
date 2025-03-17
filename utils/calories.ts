import { ActivityLevel, CalorieHistory, Gender, WeightHistory } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const dateToDashedDateString = (date: Date) => {
  const options = {
    year: 'numeric' as const,
    month: '2-digit' as const,
    day: '2-digit' as const,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const dateString = date.toLocaleDateString('en-CA', options);

  return dateString.replace(/\//g, '-');
};

export const getData = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error(e);
  }
};

export const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

export const fillInCalorieHistory = (rawCalorieHistory: CalorieHistory[]) => {
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

export const fillInWeightHistory = (rawWeightHistory: WeightHistory[]) => {
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

export const calculateTwoWeekChange = (weightHistory: WeightHistory[]) => {
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

type CalculateEquationTdeeParams = {
  gender?: Gender;
  weightPounds?: number;
  height?: number;
  age?: number;
  activityLevel: ActivityLevel;
};

export const calculateEquationTdee = ({
  gender = 'female',
  weightPounds,
  height,
  age = 40,
  activityLevel = 'lightExercise',
}: CalculateEquationTdeeParams) => {
  // https://www.calculator.net/calorie-calculator.html

  const defaultHeightInches = gender === 'female' ? 64 : 70;
  const defaultweightPounds = gender === 'female' ? 155 : 190;
  const weightInKg = (weightPounds ?? defaultweightPounds) / 2.20462;
  const heightInCm = (height ?? defaultHeightInches) * 2.54;

  const activityLevelMultipliers = {
    sedentary: 1.2,
    lightExercise: 1.375,
    moderateExercise: 1.55,
    heavyExercise: 1.725,
    athlete: 1.9,
  };

  let tdee;
  if (gender === 'male') {
    tdee =
      (13.397 * weightInKg + 4.799 * heightInCm - 5.677 * age + 88.362) *
      activityLevelMultipliers[activityLevel];
  } else {
    tdee =
      (9.247 * weightInKg + 3.098 * heightInCm - 4.33 * age + 447.593) *
      activityLevelMultipliers[activityLevel];
  }

  return Math.round(tdee * 1) / 1;
};

type CalculateTdeeParams = {
  gender?: Gender;
  weightPounds?: number;
  height?: number;
  age?: number;
  activityLevel: ActivityLevel;
  weightHistory: WeightHistory[];
  calorieHistory: CalorieHistory[];
};

export const calculateTdee = ({
  gender = 'female',
  height,
  age = 40,
  activityLevel = 'lightExercise',
  weightHistory,
  calorieHistory,
}: CalculateTdeeParams) => {
  if (weightHistory.length < 14 || calorieHistory.length < 14) {
    // if there are not 14 entries in the last 30 days for either weight or calories, return the equation TDEE
    return calculateEquationTdee({
      gender,
      weightPounds: weightHistory.at(-1)?.weight,
      height,
      age,
      activityLevel,
    });
  }

  const filledInCalorieHistory = fillInCalorieHistory(calorieHistory);

  // sum the most recent 28 days of calories, not including today
  const mostRecent28DaysNotIncludingToday = filledInCalorieHistory.slice(-29, -1);
  const calories = mostRecent28DaysNotIncludingToday.reduce(
    (acc, entry) => acc + entry.calories,
    0
  );

  const twoWeekChange = calculateTwoWeekChange(weightHistory);
  const totalCaloriesLost = -twoWeekChange * 3500; // negative because it's weight lost
  const totalCaloriesEaten = calories / 2; // we summed 28 days, so divide by 2 to get 14 day average
  const totalCaloriesBurned = totalCaloriesEaten + totalCaloriesLost;

  return Math.round(totalCaloriesBurned / 14);
};
