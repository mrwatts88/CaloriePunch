import { ReactNode } from 'react';
import { SafeAreaView, View } from 'react-native';

export const AppContainer = ({ children }: { children: ReactNode }) => {
  return (
    <SafeAreaView className="flex-1 bg-[#FFF8DC]">
      <View className="flex-1 px-5 mb-1">{children}</View>
    </SafeAreaView>
  );
};
