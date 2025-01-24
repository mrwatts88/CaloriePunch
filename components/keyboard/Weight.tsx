import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type ButtonProps = {
  title: string;
  onPress: () => void;
};

type KeyboardProps = {
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
};

const Button: React.FC<ButtonProps> = ({ title, onPress }) => (
  <TouchableOpacity
    disabled={title === 'skip'}
    style={[
      styles.button,
      {
        backgroundColor: ['back'].includes(title) ? '#FF7648' : '#4DC591',
      },
    ]}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }}
  >
    {title === 'back' ? (
      <Icon name="arrow-back" size={30} color="white" />
    ) : title === 'skip' ? null : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const WideButton: React.FC<ButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    style={[styles.wideButton, { backgroundColor: '#FF7648' }]}
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
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((button) => (
            <Button
              key={button.toString()}
              title={button.toString()}
              onPress={() => handleButtonPress(button.toString())}
            />
          ))}
        </View>
      ))}
      <WideButton title="submit" onPress={() => handleButtonPress('submit')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    marginRight: 2,
    marginBottom: 2,
    flex: 1,
    height: 60,
    backgroundColor: '#4DC591',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wideButton: {
    marginRight: 2,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
});
