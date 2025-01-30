import { useWeightLoss } from '@/context/WeightLossContext';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContainer } from './AppContainer';

export const Settings = () => {
  const {
    weightLossGoal,
    setWeightLossGoal,
    setShowSettings,
    gender,
    setGender,
    activityLevel,
    setActivityLevel,
  } = useWeightLoss();

  const weightLossGoalButtons = [
    {
      title: '0.5',
      onPress: () => {
        setWeightLossGoal(0.5);
      },
      isActive: weightLossGoal === 0.5,
    },
    {
      title: '1',
      onPress: () => {
        setWeightLossGoal(1.0);
      },
      isActive: weightLossGoal === 1.0,
    },
    {
      title: '1.5',
      onPress: () => {
        setWeightLossGoal(1.5);
      },
      isActive: weightLossGoal === 1.5,
    },
  ];

  const genderButtons = [
    {
      title: 'Male',
      onPress: () => {
        setGender('male');
      },
      isActive: gender === 'male',
    },
    {
      title: 'Female',
      onPress: () => {
        setGender('female');
      },
      isActive: gender === 'female',
    },
  ];

  const activityLevelButtons = [
    {
      title: 'Sedentary',
      onPress: () => {
        setActivityLevel('sedentary');
      },
      isActive: activityLevel === 'sedentary',
    },
    {
      title: 'Light Exercise',
      onPress: () => {
        setActivityLevel('lightExercise');
      },
      isActive: activityLevel === 'lightExercise',
    },
    {
      title: 'Moderate Exercise',
      onPress: () => {
        setActivityLevel('moderateExercise');
      },
      isActive: activityLevel === 'moderateExercise',
    },
    {
      title: 'Heavy Exercise',
      onPress: () => {
        setActivityLevel('heavyExercise');
      },
      isActive: activityLevel === 'heavyExercise',
    },
  ];

  return (
    <AppContainer>
      <View className="w-full flex flex-col mb-8">
        <View className="flex flex-row justify-between items-center w-full">
          <View className="w-[55px]" />
          <Text className="text-slate-700 text-4xl font-bold text-center flex-1">Settings</Text>
          <TouchableOpacity
            onPress={() => {
              setShowSettings(false);
            }}
            className="shadow-sm bg-[#FFF8DC] h-[55px] w-[55px] rounded-lg justify-center items-center border-2 border-[#4DC591]"
          >
            <Icon name="close" size={30} color="#4DC591" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1">
        <View className="mb-6">
          <Text className="text-slate-700 mb-2 font-bold text-center">
            Weight Loss Goal (lbs/week)
          </Text>
          <ButtonToggleGroup buttons={weightLossGoalButtons} />
        </View>
        <View className="mb-6">
          <Text className="text-slate-700 mb-2 font-bold text-center">Gender</Text>
          <ButtonToggleGroup buttons={genderButtons} />
        </View>
        <View className="mb-6">
          <Text className="text-slate-700 mb-2 font-bold text-center">Activity Level</Text>
          <VerticalButtonToggleGroup buttons={activityLevelButtons} />
        </View>
      </View>
    </AppContainer>
  );
};

type ToggleButton = {
  title: string;
  onPress: () => void;
  isActive: boolean;
};

type ButtonToggleGroupProps = {
  buttons: ToggleButton[];
};

const ButtonToggleGroup: React.FC<ButtonToggleGroupProps> = ({ buttons }) => {
  return (
    <View className="flex-row mb-2 w-full justify-center">
      {buttons.map((button, index) => (
        <Pressable
          key={index}
          onPress={button.onPress}
          className={`justify-center p-2 w-[85px] h-[50px] ${
            index === 0 ? 'rounded-l-lg' : ''
          } ${index === buttons.length - 1 ? 'rounded-r-lg' : ''} ${
            button.isActive ? 'bg-[#8F98FF]' : 'bg-[#8F98FF99]'
          } ${index !== buttons.length - 1 ? 'border-r border-white' : ''}`}
        >
          <Text className="text-xl font-bold text-center text-white">{button.title}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const VerticalButtonToggleGroup: React.FC<ButtonToggleGroupProps> = ({ buttons }) => {
  return (
    <View className="flex-col mb-2 w-full items-center">
      {buttons.map((button, index) => (
        <Pressable
          key={index}
          onPress={button.onPress}
          className={`justify-center p-2 h-[50px] w-1/2 ${
            index === 0 ? 'rounded-t-lg' : ''
          } ${index === buttons.length - 1 ? 'rounded-b-lg' : ''} ${
            button.isActive ? 'bg-[#8F98FF]' : 'bg-[#8F98FF99]'
          } ${index !== buttons.length - 1 ? 'border-b border-white' : ''}`}
        >
          <Text className="text-xl font-bold text-center text-white">{button.title}</Text>
        </Pressable>
      ))}
    </View>
  );
};
