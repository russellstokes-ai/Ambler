import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage, StoryInsight } from '../../../types';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { StatCounter } from '../../core/StatCounter';

interface StoryInsightsPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

interface StatCardProps {
  insight: StoryInsight;
  preset: ThemePreset;
  index: number;
  reduceMotion: boolean;
}

function StatCard({ insight, preset, index, reduceMotion }: StatCardProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 20);
  const isFunTone = insight.tone === 'fun';
  const isPopAnimation = preset.motion === 'playful' || preset.motion === 'fast';
  const scale = useSharedValue(reduceMotion ? 1 : isFunTone && isPopAnimation ? 0.8 : 0.95);

  const delayMs = index * 80;

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    if (isFunTone && isPopAnimation) {
      scale.value = withDelay(delayMs, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }));
    } else {
      scale.value = withDelay(delayMs, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const tc = preset.colors;
  const isWrapped = preset.insightStyle === 'wrapped';
  const isMapStats = preset.insightStyle === 'map_stats';
  const isBold = preset.insightStyle === 'bold';

  // Try to parse numeric value for count-up
  const numericValue = parseNumericValue(insight.value);
  const suffix = extractSuffix(insight.value);
  const prefix = extractPrefix(insight.value);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isWrapped ? (index % 2 === 0 ? tc.primary : tc.secondary) : tc.surface,
          borderRadius: isWrapped ? 6 : preset.card.borderRadius,
          padding: isWrapped ? 20 : 18,
          borderWidth: isMapStats ? 1 : preset.card.borderWidth,
          borderColor: isMapStats ? preset.mapPalette.route : preset.card.borderColor,
          shadowColor: isBold || isWrapped ? tc.accent : tc.primary,
          shadowOpacity: preset.card.shadowOpacity,
          shadowRadius: preset.card.shadowRadius,
          shadowOffset: { width: 0, height: isWrapped ? 4 : 8 },
          elevation: isWrapped ? 2 : 4,
          width: '48%',
          minHeight: isWrapped ? 148 : 132,
        },
        animatedStyle,
      ]}
    >
      {numericValue !== null ? (
        <StatCounter
          value={numericValue}
          prefix={prefix}
          suffix={suffix}
          durationMs={getStatDuration(preset.motion)}
          fontSize={isWrapped ? 34 : isFunTone ? 26 : 28}
          color={isWrapped ? tc.text : isMapStats ? preset.mapPalette.route : isFunTone ? tc.accent : tc.text}
          fontWeight={preset.typography.titleWeight as '900'}
        />
      ) : (
        <Text
          style={{
            color: isWrapped ? tc.text : isMapStats ? preset.mapPalette.route : isFunTone ? tc.accent : tc.text,
            fontSize: isWrapped ? 30 : isFunTone ? 22 : 24,
            fontWeight: '900',
            letterSpacing: 0,
          }}
        >
          {insight.value}
        </Text>
      )}
      <Text
        style={{
          color: isWrapped ? 'rgba(255,255,255,0.78)' : tc.textMuted,
          marginTop: 6,
          fontSize: 12,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: preset.typography.captionLetterSpacing,
        }}
      >
        {insight.label}
      </Text>
    </Animated.View>
  );
}

function parseNumericValue(value: string): number | null {
  // Extract the first number from strings like "12 km", "5h", "3", "1.2k"
  const match = value.match(/[\d.]+/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return isNaN(num) ? null : num;
}

function extractSuffix(value: string): string {
  const match = value.match(/[\d.]+\s*(.*)$/);
  return match ? match[1].trim() : '';
}

function extractPrefix(value: string): string {
  const match = value.match(/^([^\d.]*)[\d.]+/);
  return match ? match[1].trim() : '';
}

function getStatDuration(motion: string): number {
  switch (motion) {
    case 'cinematic': return 800;
    case 'soft': return 1000;
    case 'playful': return 600;
    case 'fast': return 400;
    case 'editorial': return 700;
    default: return 800;
  }
}

export function StoryInsightsPage({ page, themePreset }: StoryInsightsPageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  const insights = (page.data.insights as StoryInsight[]) ?? [];
  const tc = themePreset.colors;

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: tc.text,
              fontSize: themePreset.typography.titleSize * 0.75,
              fontWeight: themePreset.typography.titleWeight,
              letterSpacing: themePreset.typography.titleLetterSpacing,
              textTransform: themePreset.typography.titleTransform,
            },
          ]}
        >
          {page.title}
        </Text>
        <Text style={[styles.subtitle, { color: tc.textMuted }]}>
          {page.subtitle}
        </Text>

        <View style={styles.grid}>
          {insights.map((insight, i) => (
            <StatCard
              key={insight.key}
              insight={insight}
              preset={themePreset}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
