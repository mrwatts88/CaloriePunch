import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

enum Mode {
  Calories = 'calories',
  Weight = 'weight',
}

export default function HomeScreen() {
  const [mode, setMode] = React.useState(Mode.Calories);
  const [value, setValue] = React.useState('');
  const [todaysCalories, setTodaysCalories] = React.useState(0);
  const [calorieGoal, setCalorieGoal] = React.useState(2500);
  const [weight, setWeight] = React.useState(0);

  useEffect(() => {
    // TODO: get from local storage
    setCalorieGoal(2500);
    setWeight(226.3);
  }, []);


  const handleSubmitCalories = (value: string) => {
    setTodaysCalories(prev => prev + parseInt(value));
  };

  const handleSubmitWeight = (value: string) => {
    setWeight(parseFloat(value));
  };

  const handleValueChange = (value: string) => {
    setValue(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperContainer}>
        <Pressable
          onPress={() => setMode(Mode.Calories)}
          style={[
            styles.calorieBox,
            mode === Mode.Calories ? styles.buttonPressed : styles.buttonRaised,
          ]}>
          <Text style={styles.upperBoxText}>Remaining</Text>
          <Text style={[styles.upperBoxText, { marginBottom: 20 }]}>{calorieGoal - todaysCalories}</Text>
          <Text style={styles.upperBoxText2}>Calorie Goal</Text>
          <Text style={styles.upperBoxText2}>2500</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode(Mode.Weight)}
          style={[
            styles.weightBox,
            mode === Mode.Weight ? styles.buttonPressed : styles.buttonRaised,
          ]}>
          <Text style={styles.upperBoxText}>Weight</Text>
          <Text style={[styles.upperBoxText, { marginBottom: 20 }]}>{weight} lbs</Text>
          <Text style={styles.upperBoxText2}>2 Week Change</Text>
          <Text style={styles.upperBoxText2}>-1.6 lbs</Text>
        </Pressable>
      </View>
      <View style={[styles.numberContainer,
      mode === Mode.Weight ? { backgroundColor: '#FF7648' } : { backgroundColor: '#8F98FF' }
      ]}>
        {value ? <Text style={styles.text}>{value}</Text> : <Text style={[styles.text, {
          opacity: 0.5
        }]}>Enter {
            mode === Mode.Calories ? 'Calories' : 'Weight'
          }
        </Text>}
      </View>
      {mode === Mode.Calories ? (
        <CaloriesKeyboard onSubmit={handleSubmitCalories} onValueChange={handleValueChange} />
      ) : (
        <WeightKeyboard onSubmit={handleSubmitWeight} onValueChange={handleValueChange} />
      )}
      <View style={styles.completeButton}>
        <Text style={styles.completeButtonText}>Complete Day</Text>
      </View>
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
  upperContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 'auto',
    paddingTop: 20,
  },
  calorieBox: {
    flex: 1,
    backgroundColor: '#8F98FF',
    borderRadius: 10,
    marginRight: 10,
    padding: 16,
  },
  weightBox: {
    flex: 1,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#FF7648',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonPressed: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonRaised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  upperBoxText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  upperBoxText2: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  numberContainer: {
    borderRadius: 10,
    display: 'flex',
    padding: 10,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8F98FF',
    width: '100%'
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#4DC591',
    padding: 16,
    marginTop: 24,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
