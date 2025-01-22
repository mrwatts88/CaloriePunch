import { CaloriesKeyboard, WeightKeyboard } from '@/components/keyboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

enum Mode {
  Calories = 'calories',
  Weight = 'weight',
}

const getData = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error(e);
  }
};

const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

export default function HomeScreen() {
  const [mode, setMode] = React.useState(Mode.Calories);
  const [value, setValue] = React.useState('');
  const [tdee, setTdee] = React.useState(2500);
  const [deficit, setDeficit] = React.useState(500);
  const [todaysCalories, setTodaysCalories] = React.useState(0);
  const [weight, setWeight] = React.useState(0);
  const [areLocalStatsLoaded, setAreLocalStatsLoaded] = React.useState(false);

  const calorieGoal = tdee - deficit;

  useEffect(() => {
    const init = async () => {
      const localTDEE = await getData('tdee');
      const deficit = await getData('deficit');
      const localTodaysCalories = await getData('todaysCalories');
      const localWeight = await getData('weight');

      setTdee(localTDEE ? parseInt(localTDEE) : 2500);
      setDeficit(deficit ? parseInt(deficit) : 500);
      setTodaysCalories(localTodaysCalories ? parseInt(localTodaysCalories) : 0);
      setWeight(localWeight ? parseFloat(localWeight) : 0);
      setAreLocalStatsLoaded(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!areLocalStatsLoaded) return;

    storeData('tdee', tdee.toString());
    storeData('deficit', deficit.toString());
    storeData('todaysCalories', todaysCalories.toString());
    storeData('weight', weight.toString());
  }, [tdee, deficit, todaysCalories, weight]);

  const handleSubmitCalories = (calories: string) => {
    setTodaysCalories((prev) => prev + parseInt(calories));
  };

  const handleSubmitWeight = (weight: string) => {
    setWeight(parseFloat(weight));
  };

  const handleValueChange = (changedValue: string) => {
    setValue(changedValue);
  };

  const handleCompleteDay = () => {
    console.log(`Day completed: ${todaysCalories} calories, ${weight} lbs`);
    setTodaysCalories(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.upperContainer}>
        <Pressable
          onPress={() => setMode(Mode.Calories)}
          style={[
            styles.calorieBox,
            mode === Mode.Calories ? styles.buttonPressed : styles.buttonRaised,
          ]}
        >
          <View style={styles.upperBoxTextWrapper}>
            <View>
              <Text style={styles.upperBoxText2}>Calories</Text>
              <Text style={[styles.upperBoxText, { marginBottom: 20 }]}>{todaysCalories}</Text>
            </View>
            <View>
              <Text style={styles.upperBoxText2}>Remaining</Text>
              <Text style={[styles.upperBoxText]}>{calorieGoal - todaysCalories}</Text>
            </View>
          </View>
          <View style={styles.upperBoxTextWrapper}>
            <View>
              <Text style={styles.upperBoxText2}>Calorie Goal</Text>
              <Text style={[styles.upperBoxText, { marginBottom: 20 }]}>{calorieGoal}</Text>
            </View>
            <View>
              <Text style={styles.upperBoxText2}>TDEE</Text>
              <Text style={styles.upperBoxText}>{tdee}</Text>
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setMode(Mode.Weight)}
          style={[
            styles.weightBox,
            mode === Mode.Weight ? styles.buttonPressed : styles.buttonRaised,
          ]}
        >
          <View style={styles.upperBoxTextWrapper}>
            <Text style={styles.upperBoxText2}>Weight (lbs)</Text>
            <Text style={[styles.upperBoxText, { marginBottom: 0 }]}>{weight}</Text>
          </View>
          <View style={styles.upperBoxTextWrapper}>
            <Text style={styles.upperBoxText2}>2 Wk Change</Text>
            <Text style={styles.upperBoxText}>-1.6 lbs</Text>
          </View>
        </Pressable>
      </View>
      <View
        style={[
          styles.numberContainer,
          mode === Mode.Weight ? { backgroundColor: '#FF7648' } : { backgroundColor: '#8F98FF' },
        ]}
      >
        {value && value !== '0.0' ? (
          <Text style={styles.text}>{value}</Text>
        ) : (
          <Text
            style={[
              styles.text,
              {
                opacity: 0.5,
              },
            ]}
          >
            Enter {mode === Mode.Calories ? 'Calories' : 'Weight'}
          </Text>
        )}
      </View>
      {mode === Mode.Calories ? (
        <CaloriesKeyboard onSubmit={handleSubmitCalories} onValueChange={handleValueChange} />
      ) : (
        <WeightKeyboard onSubmit={handleSubmitWeight} onValueChange={handleValueChange} />
      )}
      <TouchableOpacity onPress={handleCompleteDay} style={styles.completeButton}>
        <Text style={styles.completeButtonText}>Complete Day</Text>
      </TouchableOpacity>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 'auto',
    paddingTop: 20,
  },
  calorieBox: {
    backgroundColor: '#8F98FF',
    display: 'flex',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
  },
  weightBox: {
    display: 'flex',
    justifyContent: 'center',
    marginVertical: 10,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#FF7648',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    flexDirection: 'row',
  },
  upperBoxTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
    width: '100%',
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
