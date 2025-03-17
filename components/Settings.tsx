import { FullScreenPage } from '@/components/FullScreenPage';
import { WheelPicker } from '@/components/WheelPicker';
import { useWeightLoss } from '@/context/WeightLossContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export const Settings = () => {
  const {
    weightLossGoal,
    setWeightLossGoal,
    setShowSettings,
    gender,
    setGender,
    activityLevel,
    setActivityLevel,
    age,
    setAge,
    height,
    setHeight,
  } = useWeightLoss();

  const [selectedFeet, setSelectedFeet] = useState('-');
  const [selectedInches, setSelectedInches] = useState('-');
  const [isAgeModalVisible, setIsAgeModalVisible] = useState(false);
  const [ageInput, setAgeInput] = useState(`${age ?? ''}`);

  useEffect(() => {
    if (
      selectedFeet !== '-' &&
      selectedInches !== '-' &&
      selectedFeet !== undefined &&
      selectedInches !== undefined
    ) {
      const heightInInches = parseInt(selectedFeet) * 12 + parseInt(selectedInches);
      setHeight(heightInInches);
    }
  }, [selectedFeet, selectedInches]);

  const feetFromHeight = height !== undefined ? Math.floor(height / 12).toString() : '-';
  const inchesFromHeight = height !== undefined ? (height % 12).toString() : '-';

  const handleSetAgePress = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Enter Age',
        'Please enter your age',
        (text) => {
          if (text) {
            const parsed = parseInt(text);

            if (isNaN(parsed)) {
              Alert.alert('Invalid Age', 'Please enter a valid age');
              return;
            }

            setAge(parseInt(text));
          }
        },
        undefined,
        `${age ?? ''}`,
        'numeric'
      );
    } else {
      setIsAgeModalVisible(true);
    }
  };

  const handleAgeSubmit = () => {
    const parsed = parseInt(ageInput);
    if (isNaN(parsed)) {
      Alert.alert('Invalid Age', 'Please enter a valid age');
      return;
    }
    setAge(parsed);
    setIsAgeModalVisible(false);
  };

  const weightLossGoalButtons = [
    {
      title: '0.5',
      onPress: () => {
        setWeightLossGoal(0.5);
      },
      isActive: weightLossGoal === 0.5,
    },
    {
      title: '0.75',
      onPress: () => {
        setWeightLossGoal(0.75);
      },
      isActive: weightLossGoal === 0.75,
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
    <FullScreenPage title="Settings" onClose={() => setShowSettings(false)}>
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
      <View className="mb-6 justify-center">
        <Text className="text-slate-700 mb-2 font-bold text-center">Age</Text>
        {age ? (
          <View className="flex-row space-between w-full items-center justify-center">
            <View className="w-[24px]" />
            <Text className="border rounded-lg p-2 border-[#8F98FF] mx-4 text-2xl text-slate-700 font-bold text-center">
              {age}
            </Text>
            <TouchableOpacity onPress={handleSetAgePress} className="w-[24px]">
              <MaterialIcons name="edit" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleSetAgePress}
            className={`m-auto rounded-lg bg-[#8F98FF] h-[50px] align-center justify-center p-2 px-4`}
          >
            <Text className="text-xl font-bold text-center text-white">Enter Age</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mx-24 justify-center">
        <Text className="text-slate-700 mb-2 font-bold text-center">Height</Text>
        <View className="flex-row justify-center items-center">
          <WheelPicker
            items={['-', '4', '5', '6', '7']}
            value={feetFromHeight}
            onChange={setSelectedFeet}
          />
          <Text className="text-2xl font-bold text-center mx-4">ft</Text>
          <WheelPicker
            items={['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']}
            value={inchesFromHeight}
            onChange={setSelectedInches}
          />
          <Text className="text-2xl font-bold text-center mx-4">in</Text>
        </View>
      </View>
      <Modal
        visible={isAgeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAgeModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-4/5 shadow-lg">
            <Text className="text-lg font-bold mb-4">Enter Age</Text>
            <TextInput
              value={ageInput}
              onChangeText={setAgeInput}
              keyboardType="numeric"
              className="border p-2 rounded mb-4"
              placeholder="Enter your age"
            />
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={() => setIsAgeModalVisible(false)} className="mr-4">
                <Text className="text-blue-500 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAgeSubmit}>
                <Text className="text-blue-500 font-bold">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </FullScreenPage>
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
          className={`justify-center p-2 w-[75px] h-[50px] ${
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
