import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors } from '../../styles/theme';

const GENERATION_STEPS = [
  { label: 'Organizing moments...', progress: 20 },
  { label: 'Choosing music...', progress: 42 },
  { label: 'Composing pages...', progress: 68 },
  { label: 'Adding final touches...', progress: 90 },
  { label: 'Ready!', progress: 100 },
];

interface StorybookGenerationProgressProps {
  compact?: boolean;
}

export function StorybookGenerationProgress({ compact = false }: StorybookGenerationProgressProps) {
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const progress = useSharedValue(GENERATION_STEPS[0].progress);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = GENERATION_STEPS[2].progress;
      return;
    }

    progress.value = GENERATION_STEPS[0].progress;
    const interval = setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, GENERATION_STEPS.length - 1));
    }, 900);

    return () => clearInterval(interval);
  }, [progress, reduceMotion]);

  useEffect(() => {
    const nextProgress = GENERATION_STEPS[stepIndex].progress;
    progress.value = withTiming(nextProgress, {
      duration: reduceMotion ? 0 : 720,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reduceMotion, stepIndex]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const activeStep = useMemo(() => GENERATION_STEPS[stepIndex], [stepIndex]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, progressStyle]} />
      </View>
      <Text style={[styles.stepLabel, compact && styles.stepLabelCompact]}>
        {activeStep.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    gap: 10,
    marginBottom: 24,
  },
  containerCompact: {
    paddingHorizontal: 32,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#E8E1F8',
  },
  fill: {
    height: '100%',
    minWidth: '18%',
    borderRadius: 999,
    backgroundColor: colors.purple,
  },
  stepLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  stepLabelCompact: {
    color: '#746B8C',
  },
});
