import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  baseColor?: string;
  highlightColor?: string;
  style?: ViewStyle;
}

/**
 * Shimmer loading skeleton with theme-tinted colors.
 * Animates a gradient sweep across the skeleton surface.
 * Respects reduced motion — shows static base color if enabled.
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  baseColor = 'rgba(255,255,255,0.08)',
  highlightColor = 'rgba(255,255,255,0.18)',
  style,
}: SkeletonLoaderProps) {
  const reduceMotion = useReducedMotion();
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    if (reduceMotion) return;

    shimmerX.value = -1;
    shimmerX.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {};
    }
    const translateX = shimmerX.value * 200; // pixels, not percentage
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {!reduceMotion && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '60%',
              backgroundColor: highlightColor,
            },
            animatedStyle,
          ]}
        />
      )}
    </View>
  );
}

/** A full skeleton layout for a storybook page (used while loading). */
export function StorybookSkeleton() {
  return (
    <View style={skeletonStyles.page}>
      <SkeletonLoader width="80%" height={32} borderRadius={16} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="50%" height={20} borderRadius={10} style={{ marginBottom: 32 }} />
      <View style={skeletonStyles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={skeletonStyles.card}>
            <SkeletonLoader width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="60%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="40%" height={12} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

const skeletonStyles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 22,
    backgroundColor: 'transparent',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    padding: 16,
  },
});