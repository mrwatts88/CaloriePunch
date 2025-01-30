import { ReactNode } from 'react';
import { SafeAreaView, View } from 'react-native';

export const AppContainer = ({ children }: { children: ReactNode }) => {
  return (
    <SafeAreaView className="flex-1 bg-[#FFFBEA]">
      <View className="flex-1 px-5 my-1">{children}</View>
    </SafeAreaView>
  );
};
