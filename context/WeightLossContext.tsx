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
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

interface WeightLossContextType {
  debug: boolean;
  setDebug: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  todaysCalories: number;
  setTodaysCalories: React.Dispatch<React.SetStateAction<number>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  weightLossGoal: number;
  setWeightLossGoal: React.Dispatch<React.SetStateAction<number>>;
  calorieHistory: CalorieHistory[];
  setCalorieHistory: React.Dispatch<React.SetStateAction<CalorieHistory[]>>;
  weightHistory: WeightHistory[];
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightHistory[]>>;
  areLocalStatsLoaded: boolean;
  handleSubmitCalories: (calories: string) => void;
  handleSubmitWeight: (weight: string) => void;
  handleValueChange: (changedValue: string) => void;
  showCompleteDayDialog: () => void;
  handleCompleteDay: () => void;
  twoWeekChange: number;
  tdee: number;
  deficit: number;
  calorieGoal: number;
  isTodaysWeightLogged: boolean;
}

interface WeightLossProviderProps {
  children: ReactNode;
}

const WeightLossContext = createContext<WeightLossContextType | null>(null);

export const WeightLossProvider = ({ children }: WeightLossProviderProps) => {
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState('calories');
  const [value, setValue] = useState('');
  const [todaysCalories, setTodaysCalories] = useState(DEFAULT_TODAYS_CALORIES);
  const [showSettings, setShowSettings] = useState(false);
  const [weightLossGoal, setWeightLossGoal] = useState(DEFAULT_WEIGHT_LOSS_GOAL);
  const [calorieHistory, setCalorieHistory] = useState<CalorieHistory[]>(DEFAULT_CALORIE_HISTORY);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>(DEFAULT_WEIGHT_HISTORY);
  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = useState(false);

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
        setDebug,
        mode,
        setMode,
        value,
        setValue,
        todaysCalories,
        setTodaysCalories,
        showSettings,
        setShowSettings,
        weightLossGoal,
        setWeightLossGoal,
        calorieHistory,
        setCalorieHistory,
        weightHistory,
        setWeightHistory,
        areLocalStatsLoaded,
        handleSubmitCalories,
        handleSubmitWeight,
        handleValueChange,
        showCompleteDayDialog,
        handleCompleteDay,
        twoWeekChange,
        tdee,
        deficit,
        calorieGoal,
        isTodaysWeightLogged,
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
