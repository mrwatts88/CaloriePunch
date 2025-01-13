import { Keyboard } from '@/components/keyboard';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [value, setValue] = React.useState('');
  const handleFinalValue = (value: string) => {
    console.log('Final value from Keyboard:', value);
  };

  const handleValueChange = (value: string) => {
    console.log('Value from Keyboard:', value);
    setValue(value);
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.numberContainer}>
          {value ? <Text style={styles.text}>{value}</Text>: <Text style={[styles.text, {
            opacity: 0.5
          }]}>Enter Calories</Text>}
        </View>
        <Keyboard onSubmit={handleFinalValue} onValueChange={handleValueChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  numberContainer: {
    borderRadius: 10,
    display: 'flex',
    padding: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8F98FF',
    width: '100%'
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  }
});
