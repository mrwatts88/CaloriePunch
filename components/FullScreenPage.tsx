import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppContainer } from './AppContainer';

type FullScreenPageProps = {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const FullScreenPage: React.FC<FullScreenPageProps> = ({ onClose, title, children }) => {
  return (
    <AppContainer>
      <View className="w-full flex flex-col mb-4">
        <View className="flex flex-row justify-between items-center w-full">
          <View className="w-[55px]" />
          <Text className="text-slate-700 text-4xl font-bold text-center flex-1">{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            className="shadow-sm bg-[#FFF8DC] h-[55px] w-[55px] rounded-lg justify-center items-center border-2 border-[#4DC591]"
          >
            <Icon name="close" size={30} color="#4DC591" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1">{children}</View>
    </AppContainer>
  );
};
