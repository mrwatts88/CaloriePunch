import AsyncStorage from '@react-native-async-storage/async-storage';

export type CalorieHistory = {
  calories: number;
  date: string;
};

export type WeightHistory = {
  date: string;
  weight: number;
};

export const DEFAULT_TODAYS_CALORIES = 0;
export const DEFAULT_CALORIE_HISTORY: CalorieHistory[] = [];
export const DEFAULT_WEIGHT_HISTORY: WeightHistory[] = [];
export const DEFAULT_TDEE = 2500;
export const DEFAULT_WEIGHT_LOSS_GOAL = 1.0;

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

export const calculateTdee = (weightHistory: WeightHistory[], calorieHistory: CalorieHistory[]) => {
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
