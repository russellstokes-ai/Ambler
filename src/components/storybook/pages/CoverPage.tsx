import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage, StoryInsight } from '../../../types';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { GradientButton } from '../../core/GradientButton';

interface CoverPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
  index: number;
}

interface InsightChipProps {
  insight: StoryInsight;
  preset: ThemePreset;
  delayMs: number;
  reduceMotion: boolean;
}

function InsightChip({ insight, preset, delayMs, reduceMotion }: InsightChipProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 20);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor:
            preset.insightStyle === 'wrapped'
              ? preset.colors.accent
              : `${preset.colors.surface}${Math.round(preset.card.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
          borderRadius: 99,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderWidth: preset.insightStyle === 'wrapped' ? 0 : 1,
          borderColor: preset.card.borderColor,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          color: preset.insightStyle === 'wrapped' ? preset.colors.background : preset.colors.text,
          fontSize: 12,
          fontWeight: preset.typography.bodyWeight,
          letterSpacing: preset.typography.captionLetterSpacing,
        }}
      >
        {insight.value} · {insight.label}
      </Text>
    </Animated.View>
  );
}

export function CoverPage({ page, themePreset }: CoverPageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  // Ken Burns effect
  const heroScale = useSharedValue(reduceMotion ? 1 : 1.0);

  useEffect(() => {
    if (reduceMotion) return;
    heroScale.value = 1.0;
    heroScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: themePreset.motionTiming.heroMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: themePreset.motionTiming.heroMs, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reduceMotion]);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  // Title animation
  const titleOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const titleTranslateY = useSharedValue(reduceMotion ? 0 : 20);

  // Button pulse
  const buttonScale = useSharedValue(reduceMotion ? 1 : 1.0);

  useEffect(() => {
    if (reduceMotion) return;
    titleOpacity.value = withDelay(300, withTiming(1, { duration: themePreset.motionTiming.elementMs, easing: Easing.out(Easing.cubic) }));
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: themePreset.motionTiming.elementMs, easing: Easing.out(Easing.cubic) }));

    buttonScale.value = withDelay(
      1500,
      withRepeat(
        withSequence(
        withTiming(1.03, { duration: themePreset.motionTiming.elementMs + 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: themePreset.motionTiming.elementMs + 300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [reduceMotion]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const heroData = page.data.heroMedia as { uri?: string } | undefined;
  const insights =
    ((page.data.insightTeasers as StoryInsight[] | undefined) ??
      (page.data.insights as StoryInsight[] | undefined) ??
      []);
  const tc = themePreset.colors;
  const tp = themePreset.typography;

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <Animated.View style={[styles.heroImageWrap, heroAnimatedStyle]}>
        {heroData?.uri ? (
          <Image source={{ uri: heroData.uri }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: tc.surface }]} />
        )}
      </Animated.View>
        <LinearGradient
          colors={themePreset.overlayGradient.colors}
          start={themePreset.overlayGradient.start}
          end={themePreset.overlayGradient.end}
          style={[styles.overlay, { paddingBottom: insets.bottom + 24 }]}
        >
          <View style={styles.content}>
            <Animated.Text
              style={[
                styles.kicker,
                { color: tc.textMuted, opacity: 0.82 },
                titleAnimatedStyle,
              ]}
            >
              YOUR STORYBOOK
            </Animated.Text>

            <Animated.Text
              style={[
                styles.title,
                {
                  color: tc.text,
                  fontSize: tp.titleSize,
                  fontWeight: tp.titleWeight,
                  letterSpacing: tp.titleLetterSpacing,
                  lineHeight: tp.titleSize * 1.02,
                  textTransform: tp.titleTransform,
                },
                titleAnimatedStyle,
              ]}
            >
              {page.title}
            </Animated.Text>

            <Animated.Text
              style={[
                styles.subtitle,
                { color: tc.textMuted },
                titleAnimatedStyle,
              ]}
            >
              {page.subtitle}
            </Animated.Text>

            <View style={styles.chipRow}>
              {insights.slice(0, 4).map((insight, i) => (
                <InsightChip
                  key={insight.key}
                  insight={insight}
                  preset={themePreset}
                  delayMs={600 + i * 80}
                  reduceMotion={reduceMotion}
                />
              ))}
            </View>

            <Animated.View style={buttonAnimatedStyle}>
              <GradientButton
                label="Swipe to relive it"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }}
              />
            </Animated.View>
          </View>
        </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 22,
    gap: 16,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
