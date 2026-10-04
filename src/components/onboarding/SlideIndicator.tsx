import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface SlideIndicatorProps {
  count: number;
  progress: SharedValue<number>;
  pageWidth: number;
  currentIndex: number;
  reduceMotion: boolean;
}

export function SlideIndicator({
  count,
  progress,
  pageWidth,
  currentIndex,
  reduceMotion,
}: SlideIndicatorProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 28 }]}>
      {Array.from({ length: count }).map((_, index) => (
        <IndicatorDot
          key={index}
          index={index}
          progress={progress}
          pageWidth={pageWidth}
          active={currentIndex === index}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

interface IndicatorDotProps {
  index: number;
  progress: SharedValue<number>;
  pageWidth: number;
  active: boolean;
  reduceMotion: boolean;
}

function IndicatorDot({ index, progress, pageWidth, active, reduceMotion }: IndicatorDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    if (reduceMotion || pageWidth <= 0) {
      return {
        width: active ? 26 : 8,
        opacity: active ? 1 : 0.46,
      };
    }

    const inputRange = [
      (index - 1) * pageWidth,
      index * pageWidth,
      (index + 1) * pageWidth,
    ];

    return {
      width: interpolate(progress.value, inputRange, [8, 26, 8], Extrapolate.CLAMP),
      opacity: interpolate(progress.value, inputRange, [0.46, 1, 0.46], Extrapolate.CLAMP),
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
