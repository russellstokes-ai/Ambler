import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { GradientButton } from '../core/GradientButton';

export interface OnboardingSlideProps {
  title: string;
  subtitle: string;
  gradient: [string, string];
  icon: string;
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  secondaryLabel?: string;
  primaryLabel?: string;
  isActive?: boolean;
  showSkip?: boolean;
  reduceMotion?: boolean;
}

export function OnboardingSlide({
  title,
  subtitle,
  gradient,
  icon,
  isLast,
  onNext,
  onSkip,
  secondaryLabel,
  primaryLabel,
  isActive = true,
  showSkip = true,
  reduceMotion = false,
}: OnboardingSlideProps) {
  const insets = useSafeAreaInsets();
  const illustrationScale = useSharedValue(reduceMotion ? 1 : 0.88);
  const illustrationOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const titleY = useSharedValue(reduceMotion ? 0 : 22);
  const titleOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const subtitleOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const buttonScale = useSharedValue(reduceMotion ? 1 : 0.92);
  const buttonOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      illustrationScale.value = 1;
      illustrationOpacity.value = 1;
      titleY.value = 0;
      titleOpacity.value = 1;
      subtitleOpacity.value = 1;
      buttonScale.value = 1;
      buttonOpacity.value = 1;
      return;
    }

    if (!isActive) {
      illustrationScale.value = 0.9;
      illustrationOpacity.value = 0.6;
      titleY.value = 18;
      titleOpacity.value = 0;
      subtitleOpacity.value = 0;
      buttonScale.value = 0.94;
      buttonOpacity.value = 0;
      return;
    }

    const easing = Easing.out(Easing.cubic);
    illustrationScale.value = withTiming(1, { duration: 480, easing });
    illustrationOpacity.value = withTiming(1, { duration: 360, easing });
    titleY.value = withDelay(80, withTiming(0, { duration: 420, easing }));
    titleOpacity.value = withDelay(80, withTiming(1, { duration: 360, easing }));
    subtitleOpacity.value = withDelay(190, withTiming(1, { duration: 420, easing }));
    buttonScale.value = withDelay(280, withTiming(1, { duration: 380, easing }));
    buttonOpacity.value = withDelay(280, withTiming(1, { duration: 300, easing }));
  }, [
    buttonOpacity,
    buttonScale,
    illustrationOpacity,
    illustrationScale,
    isActive,
    reduceMotion,
    subtitleOpacity,
    titleOpacity,
    titleY,
  ]);

  const illustrationStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.value,
    transform: [{ scale: illustrationScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 76 }]}
    >
      {showSkip && (
        <Pressable onPress={onSkip} hitSlop={12} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <View style={styles.content}>
        <Animated.View style={[styles.illustrationWrap, illustrationStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0.10)']}
            start={{ x: 0.15, y: 0.05 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.illustrationCircle}
          >
            <View style={styles.innerCircle}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.copy}>
          <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Animated.Text>
        </View>

        <Animated.View style={[styles.buttonWrap, buttonStyle]}>
          {isLast ? (
            <GradientButton label={primaryLabel ?? 'Get started'} onPress={onNext} />
          ) : (
            <Pressable onPress={onNext} style={styles.nextButton}>
              <Text style={styles.nextText}>{primaryLabel ?? 'Next'}</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  skipButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
  },
  illustrationWrap: {
    width: '72%',
    maxWidth: 300,
    aspectRatio: 1,
  },
  illustrationCircle: {
    flex: 1,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  innerCircle: {
    width: '68%',
    aspectRatio: 1,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  icon: {
    fontSize: 72,
  },
  copy: {
    alignItems: 'center',
    gap: 14,
    maxWidth: 340,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  nextButton: {
    minHeight: 56,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
