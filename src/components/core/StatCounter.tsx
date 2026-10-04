import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
  style?: ViewStyle;
}

/**
 * Animated count-up component using Reanimated shared values.
 * Respects reduced motion — shows final value immediately if enabled.
 */
export function StatCounter({
  value,
  suffix = '',
  prefix = '',
  durationMs = 800,
  fontSize = 28,
  color = '#FFFFFF',
  fontWeight = '900',
  style,
}: StatCounterProps) {
  const reduceMotion = useReducedMotion();
  const displayValue = useSharedValue(0);
  const [displayText, setDisplayText] = React.useState('0');

  useEffect(() => {
    if (reduceMotion) {
      setDisplayText(formatValue(value));
      return;
    }

    displayValue.value = 0;
    displayValue.value = withTiming(value, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });

    // Use derived value to update text
    const interval = setInterval(() => {
      const current = Math.round(displayValue.value);
      setDisplayText(formatValue(current));
      if (current >= value) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value, reduceMotion, durationMs]);

  function formatValue(v: number): string {
    if (v >= 1000) {
      return (v / 1000).toFixed(1) + 'k';
    }
    return Math.round(v).toString();
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize, color, fontWeight }]}>
        {prefix}{displayText}{suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  text: {
    letterSpacing: 0,
  },
});
