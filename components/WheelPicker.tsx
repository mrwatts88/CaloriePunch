import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const ITEM_HEIGHT = 35;

type WheelPickerProps = {
  items: string[];
  value: string;
  onChange: (value: string) => void;
};

export const WheelPicker: React.FC<WheelPickerProps> = ({ items, value, onChange }) => {
  interface ScrollEvent {
    nativeEvent: {
      contentOffset: {
        y: number;
      };
    };
  }

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const selectedIndex = useMemo(() => items.indexOf(value), [value]);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && isLoaded) {
      scrollViewRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }
  }, [isLoaded, scrollViewRef.current]);

  const handleScroll = (event: ScrollEvent) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    onChange(items[index]);
  };

  return (
    <View className={'h-[80px] w-[50px] overflow-hidden bg-[#8F98FF99] rounded-xl'}>
      <ScrollView
        ref={scrollViewRef}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {items.map((item, index) => (
          <Text
            key={index}
            className={
              index === selectedIndex
                ? 'text-xl text-white font-bold text-center'
                : 'text-lg text-gray-100 text-center'
            }
            style={{ height: ITEM_HEIGHT, lineHeight: ITEM_HEIGHT }}
          >
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};
