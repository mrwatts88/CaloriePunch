import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native';

export const AppContainer = ({ children }: { children: ReactNode }) => {
  return <SafeAreaView className="flex-1 justify-end items-center mx-5">{children}</SafeAreaView>;
};
