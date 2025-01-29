import React from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { AppContainer } from './AppContainer';

type SettingsPageProps = {
  close: () => void;
  updateWeightLossGoal: (goal: number) => void;
  weightLossGoal: number;
};

export const SettingsPage = ({
  close,
  updateWeightLossGoal,
  weightLossGoal,
}: SettingsPageProps) => {
  return (
    <AppContainer>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 24,
            marginVertical: 10,
          }}
        >
          Settings
        </Text>
        <Text
          style={{
            marginVertical: 10,
          }}
        >
          Weight Loss Goal (lbs/week)
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              updateWeightLossGoal(0.25);
            }}
            style={{
              backgroundColor: weightLossGoal === 0.25 ? 'grey' : 'lightgrey',
              padding: 10,
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              width: 50,
              borderRightWidth: 1,
              borderRightColor: 'white',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
              }}
            >
              0.25
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              updateWeightLossGoal(0.5);
            }}
            style={{
              backgroundColor: weightLossGoal === 0.5 ? 'grey' : 'lightgrey',
              padding: 10,
              width: 50,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
              }}
            >
              0.5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              updateWeightLossGoal(1.0);
            }}
            style={{
              backgroundColor: weightLossGoal === 1.0 ? 'grey' : 'lightgrey',
              padding: 10,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
              width: 50,
              borderLeftWidth: 1,
              borderLeftColor: 'white',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
              }}
            >
              1
            </Text>
          </TouchableOpacity>
        </View>
        <Button title="Close" onPress={close} />
      </View>
    </AppContainer>
  );
};
