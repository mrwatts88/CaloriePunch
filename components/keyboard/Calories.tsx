import { useWeightLoss } from '@/context/WeightLossContext';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import McIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type ButtonProps = {
  title: string;
  onPress: () => void;
  isEnd?: boolean;
};
const Button: React.FC<ButtonProps> = ({ title, onPress, isEnd }) => (
  <TouchableOpacity
    className={`flex-1 h-[55px] justify-center items-center mb-0.5 ${isEnd ? '' : 'mr-0.5'} ${
      ['back', 'plusminus'].includes(title) ? 'bg-[#8F98FF]' : 'bg-[#4DC591]'
    }`}
    onPress={() => {
      onPress();
    }}
  >
    {title === 'back' ? (
      <Icon name="arrow-back" size={30} color="white" />
    ) : title === 'plusminus' ? (
      <McIcon name="plus-minus" size={30} color="white" />
    ) : (
      <Text className="text-white text-4xl font-bold">{title}</Text>
    )}
  </TouchableOpacity>
);

const WideButton: React.FC<ButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    className="h-[60px] justify-center items-center bg-[#8F98FF]"
    onPress={() => {
      onPress();
    }}
  >
    <Icon name="checkmark" size={30} color="white" />
  </TouchableOpacity>
);

export const CaloriesKeyboard: React.FC = () => {
  const { handleValueChange, handleSubmitCalories } = useWeightLoss();
  const [value, setValue] = React.useState('');
  const [isNegative, setIsNegative] = React.useState(false);

  const maxLength = 4;

  const handleButtonPress = (key: string) => {
    if (key === 'back') {
      setValue((prev) => prev.slice(0, -1));
    } else if (key === 'submit') {
      const valueToSubmit = value || '0';
      const finalValue = isNegative && valueToSubmit !== '0' ? `-${valueToSubmit}` : valueToSubmit;
      handleSubmitCalories(finalValue);
      setValue('');
      setIsNegative(false);
    } else if (key === 'plusminus') {
      if (!value) {
        return;
      }

      setIsNegative((prev) => !prev);
    } else {
      setValue((prev) => {
        if (key === '0' && !prev) {
          return '';
        }

        if ((prev + key).length > maxLength) {
          return prev;
        }

        return prev + key;
      });
    }
  };

  React.useEffect(() => {
    if (value === '0' || value === '' || value === '-0') {
      setIsNegative(false);
    }
  }, [value]);

  const finalValue = isNegative && value ? `-${value}` : value;
  React.useEffect(() => {
    handleValueChange(finalValue);
  }, [finalValue]);

  const rows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['back', 0, 'plusminus'],
  ];

  return (
    <View className="w-full max-w-[400px]">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row w-full">
          {row.map((button, idx) => (
            <Button
              key={button.toString()}
              title={button.toString()}
              onPress={() => handleButtonPress(button.toString())}
              isEnd={idx == 2}
            />
          ))}
        </View>
      ))}
      <WideButton title="submit" onPress={() => handleButtonPress('submit')} />
    </View>
  );
};
