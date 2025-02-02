export enum Mode {
  Calories = 'calories',
  Weight = 'weight',
}

export type CalorieHistory = {
  calories: number;
  date: string;
};

export type WeightHistory = {
  date: string;
  weight: number;
};

export type Gender = 'male' | 'female';
export type ActivityLevel =
  | 'sedentary'
  | 'lightExercise'
  | 'moderateExercise'
  | 'heavyExercise'
  | 'athlete';
