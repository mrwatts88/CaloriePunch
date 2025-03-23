import { useWeightLoss } from '@/context/WeightLossContext';
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export const Graph = () => {
  const { weightHistory: wh } = useWeightLoss();
  const weightHistory = wh.slice(-30);

  const data = {
    labels: weightHistory.map((entry, idx) => (idx % 5 === 0 ? entry.date.slice(-5) : '')),
    datasets: [{ data: weightHistory.map((entry) => entry.weight) }],
  };

  return (
    <View className="mt-4 items-center justify-center">
      {weightHistory.length > 0 && (
        <LineChart
          data={data}
          withShadow={false}
          withInnerLines={true}
          withVerticalLines={false}
          withOuterLines={false}
          width={Dimensions.get('window').width - 35}
          verticalLabelRotation={30}
          height={210}
          style={{
            borderRadius: 8,
          }}
          xLabelsOffset={-10}
          yLabelsOffset={20}
          chartConfig={{
            backgroundGradientFrom: '#8F98FF',
            backgroundGradientTo: '#8F98FF',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
      )}
    </View>
  );
};
