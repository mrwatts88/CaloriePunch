import { ReactNode } from 'react';
import { Platform, SafeAreaView, View } from 'react-native';

export const AppContainer = ({ children }: { children: ReactNode }) => {
  return (
    <SafeAreaView className={`flex-1 bg-[#FFFBEA] ${Platform.OS === 'android' ? 'pb-6 pt-8' : ''}`}>
      <View className="flex-1 px-5 my-1">{children}</View>
    </SafeAreaView>
  );
};
