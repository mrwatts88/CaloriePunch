import { ActivityLevel, CalorieHistory, Gender, WeightHistory } from '@/types/types';
import {
  calculateTdee,
  calculateTwoWeekChange,
  dateToDashedDateString,
  getData,
  storeData,
} from '@/utils/calories';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const DEFAULT_TODAYS_CALORIE_ENTRIES: number[] = [];
const DEFAULT_CALORIE_HISTORY: CalorieHistory[] = [];
const DEFAULT_WEIGHT_HISTORY: WeightHistory[] = [];
const DEFAULT_WEIGHT_LOSS_GOAL = 1.0;

interface WeightLossContextType {
  debug: boolean;
  mode: string;
  value: string;
  todaysCalories: number;
  todaysCalorieEntries: number[];
  showSettings: boolean;
  showCalorieLog: boolean;
  showSummary: boolean;
  weightLossGoal: number;
  calorieHistory: CalorieHistory[];
  weightHistory: WeightHistory[];
  twoWeekChange: number;
  tdee: number;
  deficit: number;
  calorieGoal: number;
  isTodaysWeightLogged: boolean;
  gender: Gender | undefined;
  activityLevel: ActivityLevel;
  caloriesLeft: number;
  age: number | undefined;
  height: number | undefined;
  setDebug: React.Dispatch<React.SetStateAction<boolean>>;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setWeightLossGoal: React.Dispatch<React.SetStateAction<number>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCalorieLog: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmitCalories: (calories: string) => void;
  handleSubmitWeight: (weight: string) => void;
  handleValueChange: (changedValue: string) => void;
  showCompleteDayDialog: () => void;
  setGender: React.Dispatch<React.SetStateAction<Gender | undefined>>;
  setActivityLevel: React.Dispatch<React.SetStateAction<ActivityLevel>>;
  removeCalorieEntry: (idx: number) => void;
  setAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  resetCalories: () => void;
  resetTodaysWeight: () => void;
  setHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
}

interface WeightLossProviderProps {
  children: ReactNode;
}

const WeightLossContext = createContext<WeightLossContextType | null>(null);

export const WeightLossProvider = ({ children }: WeightLossProviderProps) => {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState('calories');
  const [value, setValue] = useState('');
  const [todaysCalorieEntries, setTodaysCalorieEntries] = useState(DEFAULT_TODAYS_CALORIE_ENTRIES);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCalorieLog, setShowCalorieLog] = useState(false);
  const [calorieHistory, setCalorieHistory] = useState<CalorieHistory[]>(DEFAULT_CALORIE_HISTORY);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>(DEFAULT_WEIGHT_HISTORY);
  const [weightLossGoal, setWeightLossGoal] = useState(DEFAULT_WEIGHT_LOSS_GOAL);
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('lightExercise');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const localTodaysCalorieEntries = await getData('todaysCalorieEntries');
      const localCalorieHistory = await getData('calorieHistory');
      const localWeightHistory = await getData('weightHistory');
      const localWeightLossGoal = await getData('weightLossGoal');
      const localAge = await getData('age');
      const localActivityLevel = await getData('activityLevel');
      const localGender = await getData('gender');
      const localHeight = await getData('height');

      setTodaysCalorieEntries(
        localTodaysCalorieEntries
          ? JSON.parse(localTodaysCalorieEntries)
          : DEFAULT_TODAYS_CALORIE_ENTRIES
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
      setAge(localAge ? parseInt(localAge) : undefined);
      setActivityLevel((localActivityLevel ?? 'lightExercise') as ActivityLevel);
      setGender((localGender ?? undefined) as Gender);
      setHeight(localHeight ? parseInt(localHeight) : undefined);
      setAreLocalStatsLoaded(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!areLocalStatsLoaded) return;

    storeData('todaysCalorieEntries', JSON.stringify(todaysCalorieEntries));
    storeData('calorieHistory', JSON.stringify(calorieHistory));
    storeData('weightHistory', JSON.stringify(weightHistory));
    storeData('weightLossGoal', weightLossGoal.toString());
    storeData('age', age?.toString() ?? '');
    storeData('activityLevel', activityLevel);
    storeData('gender', gender ?? '');
    storeData('height', height?.toString() ?? '');
  }, [
    todaysCalorieEntries,
    calorieHistory,
    weightHistory,
    weightLossGoal,
    age,
    activityLevel,
    gender,
    height,
    areLocalStatsLoaded,
  ]);

  const handleSubmitCalories = (calories: string) => {
    if (!calories || parseInt(calories) === 0) {
      return;
    }

    setTodaysCalorieEntries((prev) => [...prev, parseInt(calories)]);
  };

  const handleSubmitWeight = (weight: string) => {
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

  const todaysCalories = useMemo(
    () => todaysCalorieEntries.reduce((acc, curr) => acc + curr, 0),
    [todaysCalorieEntries]
  );

  const showCompleteDayDialog = () => {
    Alert.alert(
      `Completing day with ${todaysCalories} calories`,
      'Is this calorie total for yesterday or today?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yesterday',
          onPress: () => handleCompleteDay(true),
        },
        {
          text: 'Today',
          onPress: () => handleCompleteDay(),
        },
      ]
    );
  };

  const handleCompleteDay = (yesterday = false) => {
    const todaysDate = dateToDashedDateString(new Date());
    const yesterdaysDate = dateToDashedDateString(
      new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
    );

    const dateOfEntry = yesterday ? yesterdaysDate : todaysDate;
    const existingEntry = calorieHistory.find((entry) => entry.date === dateOfEntry);

    let updatedCalorieHistory: CalorieHistory[] = [];
    if (existingEntry) {
      updatedCalorieHistory = calorieHistory.map((entry) => {
        if (entry.date === dateOfEntry) {
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
          date: dateOfEntry,
        },
      ];
    }

    setCalorieHistory(updatedCalorieHistory.slice(-30)); // todo: cut off entries older than 30 days
    setTodaysCalorieEntries([]);
  };

  const twoWeekChange = useMemo(() => calculateTwoWeekChange(weightHistory), [weightHistory]);
  const tdee = useMemo(
    () =>
      calculateTdee({
        gender,
        heightInches: height,
        age,
        activityLevel,
        weightHistory, // todo: pass units
        calorieHistory,
      }),
    [weightHistory, calorieHistory, gender, activityLevel, age, height]
  );
  const deficit = useMemo(() => (weightLossGoal * 3500) / 7, [weightLossGoal]);
  const calorieGoal = tdee - deficit;

  const isTodaysWeightLogged = useMemo(
    () =>
      !!(weightHistory.at(-1) && weightHistory.at(-1)!.date === dateToDashedDateString(new Date())),
    [weightHistory]
  );

  useEffect(() => {
    if (isTodaysWeightLogged) {
      setMode('calories');
    }
  }, [isTodaysWeightLogged]);

  return (
    <WeightLossContext.Provider
      value={{
        debug,
        mode,
        value,
        todaysCalories,
        todaysCalorieEntries,
        showSettings,
        showSummary,
        showCalorieLog,
        weightLossGoal,
        calorieHistory,
        weightHistory,
        twoWeekChange,
        tdee,
        deficit,
        calorieGoal,
        isTodaysWeightLogged,
        gender,
        activityLevel,
        caloriesLeft: calorieGoal - todaysCalories,
        age,
        height,
        handleSubmitCalories,
        handleSubmitWeight,
        handleValueChange,
        showCompleteDayDialog,
        setMode,
        setValue,
        setDebug,
        setShowSettings,
        setShowSummary,
        setShowCalorieLog,
        setWeightLossGoal,
        setGender,
        setActivityLevel,
        setAge,
        setHeight,
        removeCalorieEntry: (idx: number) => {
          setTodaysCalorieEntries((prev) => prev.filter((_, i) => i !== idx));
        },
        resetCalories: () => {
          setTodaysCalorieEntries([]);
        },
        resetTodaysWeight: () => {
          setWeightHistory(
            weightHistory.filter((entry) => entry.date !== dateToDashedDateString(new Date()))
          );
        },
      }}
    >
      {children}
    </WeightLossContext.Provider>
  );
};

export const useWeightLoss = () => {
  const context = useContext(WeightLossContext);
  if (!context) {
    throw new Error('useWeightLoss must be used within a WeightLossProvider');
  }
  return context;
};
