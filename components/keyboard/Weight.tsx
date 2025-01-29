import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type ButtonProps = {
  title: string;
  onPress: () => void;
  isEnd?: boolean;
};

type KeyboardProps = {
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
};

const Button: React.FC<ButtonProps> = ({ title, onPress, isEnd }) => (
  <TouchableOpacity
    disabled={title === 'skip'}
    className={`flex-1 h-[60px] justify-center items-center mb-0.5 ${isEnd ? '' : 'mr-0.5'} ${
      ['back', 'skip'].includes(title) ? 'bg-[#FF7648]' : 'bg-[#4DC591]'
    }`}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }}
  >
    {title === 'back' ? (
      <Icon name="arrow-back" size={30} color="white" />
    ) : title === 'skip' ? null : (
      <Text className="text-white text-2xl font-bold">{title}</Text>
    )}
  </TouchableOpacity>
);

const WideButton: React.FC<ButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    className="h-[60px] justify-center items-center bg-[#FF7648]"
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }}
  >
    <Icon name="checkmark" size={30} color="white" />
  </TouchableOpacity>
);

export const WeightKeyboard: React.FC<KeyboardProps> = ({ onSubmit, onValueChange }) => {
  const [value, setValue] = React.useState('');
  const maxLength = 4;

  const handleButtonPress = (key: string) => {
    if (key === 'skip') {
      return;
    } else if (key === 'back') {
      setValue((prev) => prev.slice(0, -1));
    } else if (key === 'submit') {
      const valueToSubmit = value || '0';

      let valueWithDecimalBeforeLastDigit =
        valueToSubmit.slice(0, -1) + '.' + valueToSubmit.slice(-1);
      if (valueWithDecimalBeforeLastDigit.startsWith('.')) {
        valueWithDecimalBeforeLastDigit = '0' + valueWithDecimalBeforeLastDigit;
      }

      if (valueWithDecimalBeforeLastDigit.endsWith('.')) {
        valueWithDecimalBeforeLastDigit = valueWithDecimalBeforeLastDigit + '0';
      }

      onSubmit?.(valueWithDecimalBeforeLastDigit);
      setValue('');
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
    // put a decimal before the last digit
    let valueWithDecimalBeforeLastDigit = value.slice(0, -1) + '.' + value.slice(-1);
    if (valueWithDecimalBeforeLastDigit.startsWith('.')) {
      valueWithDecimalBeforeLastDigit = '0' + valueWithDecimalBeforeLastDigit;
    }

    if (valueWithDecimalBeforeLastDigit.endsWith('.')) {
      valueWithDecimalBeforeLastDigit = valueWithDecimalBeforeLastDigit + '0';
    }

    onValueChange?.(valueWithDecimalBeforeLastDigit);
  }, [value]);

  const rows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['back', 0, 'skip'],
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
