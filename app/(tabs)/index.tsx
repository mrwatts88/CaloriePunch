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

export default function HomeScreen() {
  const handleFinalValue = (value: string) => {
    console.log('Final value from Keyboard:', value);
  };

  const handleValueChange = (value: string) => {
    console.log('Value from Keyboard:', value);
  };

  return (
    <View style={styles.container}>
      <Keyboard onSubmit={handleFinalValue} onValueChange={handleValueChange} />
    </View>
  );
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    {
      title === 'back' ? (
        <Icon name="arrow-back" size={30} color="white" />
      ) : title === 'submit' ? (
        <Icon name="checkmark" size={30} color="white" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )
    }
  </TouchableOpacity>
);

const Keyboard: React.FC<KeyboardProps> = ({ onSubmit, onValueChange }) => {
  const [value, setValue] = React.useState('');

  const handleButtonPress = (key: string) => {
    if (key === 'back') {
      setValue((prev) => prev.slice(0, -1));
    } else if (key === 'submit') {
      onSubmit?.(parseInt(value || '0', 10).toString());
      setValue('');
    } else {
      setValue((prev) => prev + key);
    }
  };

  React.useEffect(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  const rows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['back', 0, 'submit'],
  ];

  return (
    <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    margin: 10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4DC591',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
