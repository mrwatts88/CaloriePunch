import { ReactNode } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export const AppContainer = ({ children }: { children: ReactNode }) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});
