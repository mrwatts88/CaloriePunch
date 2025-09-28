import { ActivityLevel, CalorieHistory, Gender, WeightHistory } from '@/types/types';
import { NutritionData } from '@/types/aiTypes';
import {
  calculateTdee,
  calculateTwoWeekChange,
  dateToDashedDateString,
  getData,
  storeData,
} from '@/utils/calories';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

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
  todaysSugar: number;
  todaysWater: number;
  todaysProtein: number;
  todaysCaffeine: number;
  showSettings: boolean;
  showCalorieLog: boolean;
  showSummary: boolean;
  showCompleteDayModal: boolean;
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
  setShowCompleteDayModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmitCalories: (calories: string) => void;
  handleSubmitWeight: (weight: string) => void;
  handleValueChange: (changedValue: string) => void;
  showCompleteDayDialog: () => void;
  handleCompleteDay: (yesterday?: boolean) => void;
  setGender: React.Dispatch<React.SetStateAction<Gender | undefined>>;
  setActivityLevel: React.Dispatch<React.SetStateAction<ActivityLevel>>;
  removeCalorieEntry: (idx: number) => void;
  setAge: React.Dispatch<React.SetStateAction<number | undefined>>;
  resetCalories: () => void;
  resetTodaysWeight: () => void;
  setHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  addSugar: () => void;
  addWater: () => void;
  addProtein: () => void;
  addCaffeine: () => void;
  subtractSugar: () => void;
  subtractWater: () => void;
  subtractProtein: () => void;
  subtractCaffeine: () => void;
  handleAISubmission: (data: NutritionData) => void;
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
  const [todaysSugar, setTodaysSugar] = useState(0);
  const [todaysWater, setTodaysWater] = useState(0);
  const [todaysProtein, setTodaysProtein] = useState(0);
  const [todaysCaffeine, setTodaysCaffeine] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCalorieLog, setShowCalorieLog] = useState(false);
  const [showCompleteDayModal, setShowCompleteDayModal] = useState(false);
  const [calorieHistory, setCalorieHistory] = useState<CalorieHistory[]>(DEFAULT_CALORIE_HISTORY);
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>(DEFAULT_WEIGHT_HISTORY);
  const [weightLossGoal, setWeightLossGoal] = useState(DEFAULT_WEIGHT_LOSS_GOAL);
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('lightExercise');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const localTodaysCalorieEntries = await getData('todaysCalorieEntries');
      const localTodaysSugar = await getData('todaysSugar');
      const localTodaysWater = await getData('todaysWater');
      const localTodaysProtein = await getData('todaysProtein');
      const localTodaysCaffeine = await getData('todaysCaffeine');
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
      setTodaysSugar(localTodaysSugar ? parseInt(localTodaysSugar) : 0);
      setTodaysWater(localTodaysWater ? parseInt(localTodaysWater) : 0);
      setTodaysProtein(localTodaysProtein ? parseInt(localTodaysProtein) : 0);
      setTodaysCaffeine(localTodaysCaffeine ? parseInt(localTodaysCaffeine) : 0);
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
    storeData('todaysSugar', todaysSugar.toString());
    storeData('todaysWater', todaysWater.toString());
    storeData('todaysProtein', todaysProtein.toString());
    storeData('todaysCaffeine', todaysCaffeine.toString());
    storeData('calorieHistory', JSON.stringify(calorieHistory));
    storeData('weightHistory', JSON.stringify(weightHistory));
    storeData('weightLossGoal', weightLossGoal.toString());
    storeData('age', age?.toString() ?? '');
    storeData('activityLevel', activityLevel);
    storeData('gender', gender ?? '');
    storeData('height', height?.toString() ?? '');
  }, [
    todaysCalorieEntries,
    todaysSugar,
    todaysWater,
    todaysProtein,
    todaysCaffeine,
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

    setWeightHistory(updatedWeightHistory.slice(-30));
  };

  const handleValueChange = (changedValue: string) => {
    setValue(changedValue);
  };

  const todaysCalories = useMemo(
    () => todaysCalorieEntries.reduce((acc, curr) => acc + curr, 0),
    [todaysCalorieEntries]
  );

  const showCompleteDayDialog = () => {
    setShowCompleteDayModal(true);
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

    setCalorieHistory(updatedCalorieHistory.slice(-30));
    setTodaysCalorieEntries([]);
    setTodaysSugar(0);
    setTodaysWater(0);
    setTodaysProtein(0);
    setTodaysCaffeine(0);
  };

  const twoWeekChange = useMemo(() => calculateTwoWeekChange(weightHistory), [weightHistory]);
  const tdee = useMemo(
    () =>
      calculateTdee({
        gender,
        height,
        age,
        activityLevel,
        weightHistory,
        calorieHistory,
      }),
    [weightHistory, calorieHistory, gender, activityLevel, age, height]
  );
  const deficit = useMemo(() => (weightLossGoal * 3500) / 7, [weightLossGoal]);
  const calorieGoal = tdee - deficit;

  const isTodaysWeightLogged = useMemo(
    () =>
      !!(weightHistory.at(-1) && weightHistory.at(-1)!.date === dateToDashedDateString(new Date())),
    [weightHistory, appStateVisible]
  );

  useEffect(() => {
    if (isTodaysWeightLogged) {
      setMode('calories');
    }
  }, [isTodaysWeightLogged]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <WeightLossContext.Provider
      value={{
        debug,
        mode,
        value,
        todaysCalories,
        todaysCalorieEntries,
        todaysSugar,
        todaysWater,
        todaysProtein,
        todaysCaffeine,
        showSettings,
        showSummary,
        showCalorieLog,
        showCompleteDayModal,
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
        caloriesLeft: Math.round(calorieGoal - todaysCalories),
        age,
        height,
        handleSubmitCalories,
        handleSubmitWeight,
        handleValueChange,
        showCompleteDayDialog,
        handleCompleteDay,
        setMode,
        setValue,
        setDebug,
        setShowSettings,
        setShowSummary,
        setShowCalorieLog,
        setShowCompleteDayModal,
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
        addSugar: () => {
          setTodaysSugar((prev) => prev + 3);
        },
        addWater: () => {
          setTodaysWater((prev) => prev + 8);
        },
        addProtein: () => {
          setTodaysProtein((prev) => prev + 5);
        },
        addCaffeine: () => {
          setTodaysCaffeine((prev) => prev + 25);
        },
        subtractSugar: () => {
          setTodaysSugar((prev) => Math.max(0, prev - 3));
        },
        subtractWater: () => {
          setTodaysWater((prev) => Math.max(0, prev - 8));
        },
        subtractProtein: () => {
          setTodaysProtein((prev) => Math.max(0, prev - 5));
        },
        subtractCaffeine: () => {
          setTodaysCaffeine((prev) => Math.max(0, prev - 25));
        },
        handleAISubmission: (data: NutritionData) => {
          // Add calories if any
          if (data.calories > 0) {
            setTodaysCalorieEntries((prev) => [...prev, Math.round(data.calories)]);
          }

          // Add macros
          if (data.protein > 0) {
            setTodaysProtein((prev) => prev + Math.round(data.protein));
          }
          if (data.sugar > 0) {
            setTodaysSugar((prev) => prev + Math.round(data.sugar));
          }
          if (data.caffeine > 0) {
            setTodaysCaffeine((prev) => prev + Math.round(data.caffeine));
          }
          if (data.water > 0) {
            setTodaysWater((prev) => prev + Math.round(data.water));
          }
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
