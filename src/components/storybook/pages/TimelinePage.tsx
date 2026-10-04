import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage } from '../../../types';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface TimelinePageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

interface TimelineCluster {
  hour?: string;
  timeRange?: string;
  title: string;
  media?: Array<{ uri: string; uploaderName?: string }>;
  highlights?: Array<{ uri: string; uploaderName?: string }>;
}

interface ChapterProps {
  chapter: TimelineCluster;
  index: number;
  preset: ThemePreset;
  reduceMotion: boolean;
  isLast: boolean;
}

function Chapter({ chapter, index, preset, reduceMotion, isLast }: ChapterProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 20);
  const connectorHeight = useSharedValue(reduceMotion ? 1 : 0);

  const staggerDelay = index * 80;

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(staggerDelay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(staggerDelay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    connectorHeight.value = withDelay(staggerDelay + 200, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const connectorStyle = useAnimatedStyle(() => ({
    flex: connectorHeight.value,
  }));

  const tc = preset.colors;
  const photos = chapter.media ?? chapter.highlights ?? [];
  const timeLabel = chapter.timeRange ?? formatTimeRange(chapter.hour);

  return (
    <Animated.View
      style={[
        styles.chapter,
        {
          backgroundColor: preset.preview.motif === 'columns' || preset.preview.motif === 'whitespace' ? preset.colors.surface : 'transparent',
          borderRadius: preset.card.borderRadius,
          borderWidth: preset.preview.motif === 'columns' ? preset.card.borderWidth : 0,
          borderColor: preset.card.borderColor,
          padding: preset.preview.motif === 'columns' ? 14 : 0,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.chapterHeader}>
        <View style={[styles.timelineDot, { backgroundColor: tc.accent, borderColor: tc.surface }]} />
        <View style={styles.headerText}>
          <Text style={[styles.timeRange, { color: tc.textMuted }]}>{timeLabel}</Text>
          <Text
            style={[
              styles.chapterTitle,
              {
                color: tc.text,
                fontFamily: undefined,
                letterSpacing: preset.typography.titleLetterSpacing,
                textTransform: preset.typography.titleTransform,
              },
            ]}
          >
            {chapter.title}
          </Text>
        </View>
      </View>

      <View style={styles.chapterBody}>
        {/* Timeline connector line */}
        {!isLast && (
          <View style={[styles.connectorTrack, { backgroundColor: `${tc.textMuted}22` }]}>
            <Animated.View
              style={[styles.connectorFill, { backgroundColor: tc.accent }, connectorStyle]}
            />
          </View>
        )}

        {/* Photo thumbnails */}
        <View style={styles.thumbRow}>
          {photos.slice(0, 6).map((m, i) => (
            <View
              key={i}
              style={[
                styles.thumb,
                {
                  borderRadius: preset.card.borderRadius / 2,
                  borderColor: preset.preview.motif === 'grain' ? preset.colors.surface : `${tc.textMuted}22`,
                  borderWidth: preset.preview.motif === 'grain' ? 4 : 1,
                },
              ]}
            >
              <Image source={{ uri: m.uri }} style={styles.thumbImage} />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function formatTimeRange(hourStr?: string): string {
  if (!hourStr) return '';
  // hourStr is like "2024-07-01T14"
  const date = new Date(hourStr + ':00:00');
  if (isNaN(date.getTime())) return hourStr;
  const h = date.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:00 ${ampm}`;
}

export function TimelinePage({ page, themePreset }: TimelinePageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  const clusters =
    ((page.data.chapters as TimelineCluster[] | undefined) ??
      (page.data.clusters as TimelineCluster[] | undefined) ??
      []);
  const tc = themePreset.colors;

  return (
    <View style={[styles.container, { backgroundColor: themePreset.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40, paddingHorizontal: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.pageTitle,
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
        <Text style={[styles.pageSubtitle, { color: tc.textMuted }]}>
          {page.subtitle}
        </Text>

        <View style={styles.chapters}>
          {clusters.map((cluster, index) => (
            <Chapter
              key={index}
              chapter={cluster}
              index={index}
              preset={themePreset}
              reduceMotion={reduceMotion}
              isLast={index === clusters.length - 1}
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
  pageTitle: {
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 28,
  },
  chapters: {
    gap: 4,
  },
  chapter: {
    marginBottom: 8,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    marginTop: 4,
    zIndex: 2,
  },
  headerText: {
    flex: 1,
  },
  timeRange: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  chapterBody: {
    flexDirection: 'row',
    paddingLeft: 6,
    paddingBottom: 20,
  },
  connectorTrack: {
    width: 2,
    marginRight: 14,
    borderRadius: 1,
    overflow: 'hidden',
  },
  connectorFill: {
    width: '100%',
    borderRadius: 1,
  },
  thumbRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumb: {
    width: 72,
    height: 72,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
