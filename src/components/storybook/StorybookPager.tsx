import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Storybook, StorybookPage, StorybookQualityScore } from '../../types';
import { ThemeKey } from '../../types';
import { getThemeConfig, StorybookThemeConfig } from '../../features/storybook/themeEngine';
import { getThemePreset } from '../../styles/themePresets';
import type { ThemePreset } from '../../styles/themePresets';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Page components
import { CoverPage } from './pages/CoverPage';
import { CinematicOpeningPage } from './pages/CinematicOpeningPage';
import { TimelinePage } from './pages/TimelinePage';
import { RouteReplayPage } from './pages/RouteReplayPage';
import { HeroGalleryPage } from './pages/HeroGalleryPage';
import { StoryInsightsPage } from './pages/StoryInsightsPage';
import { FriendCaptionsPage } from './pages/FriendCaptionsPage';
import { SharePage } from './pages/SharePage';

interface StorybookPagerProps {
  storybook: Storybook;
  themeKey?: ThemeKey;
  storybookId?: string;
  publicMode?: boolean;
}

interface PageRendererProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
  index: number;
  storybookId?: string;
  publicMode?: boolean;
  storybook: Storybook;
}

function PageRenderer({ page, themeConfig, themePreset, index, storybookId, publicMode, storybook }: PageRendererProps) {
  switch (page.type) {
    case 'cover':
      return <CoverPage page={page} themeConfig={themeConfig} themePreset={themePreset} index={index} />;
    case 'cinematic_opening':
      return <CinematicOpeningPage page={page} themeConfig={themeConfig} themePreset={themePreset} />;
    case 'timeline':
      return <TimelinePage page={page} themeConfig={themeConfig} themePreset={themePreset} />;
    case 'route_replay':
      return <RouteReplayPage page={page} themeConfig={themeConfig} themePreset={themePreset} />;
    case 'hero_gallery':
      return <HeroGalleryPage page={page} themeConfig={themeConfig} themePreset={themePreset} />;
    case 'story_insights':
      return <StoryInsightsPage page={page} themeConfig={themeConfig} themePreset={themePreset} />;
    case 'friend_captions':
      return <FriendCaptionsPage page={page} themeConfig={themeConfig} themePreset={themePreset} />;
    case 'share':
      return <SharePage page={page} themeConfig={themeConfig} themePreset={themePreset} storybookId={storybookId} publicMode={publicMode} storybook={storybook} />;
    default:
      return (
        <View style={[fallbackStyles.container, { backgroundColor: themePreset.colors.background }]}>
          <Text style={{ color: themePreset.colors.text, fontSize: 20, fontWeight: '800' }}>
            {page.title}
          </Text>
          <Text style={{ color: themePreset.colors.textMuted, marginTop: 8 }}>
            {page.subtitle}
          </Text>
        </View>
      );
  }
}

// ─── Quality Score Debug Overlay ──────────────────────────────

interface QualityDebugOverlayProps {
  score: StorybookQualityScore;
  preset: ThemePreset;
}

function QualityDebugOverlay({ score, preset }: QualityDebugOverlayProps) {
  if (!__DEV__) return null;

  const tc = preset.colors;
  const scores: Array<[string, number]> = [
    ['Visual', score.visualImpact],
    ['Narrative', score.narrativeFlow],
    ['Diversity', score.photoDiversity],
    ['Timeline', score.timelineCompleteness],
    ['Route', score.routeCompleteness],
    ['Share', score.shareability],
  ];

  const overall = Math.round(scores.reduce((sum, [, v]) => sum + v, 0) / scores.length);

  return (
    <View
      style={[
        debugStyles.container,
        {
          backgroundColor: `${tc.primary}DD`,
          borderColor: `${tc.accent}55`,
        },
      ]}
    >
      <Text style={debugStyles.title}>Quality: {overall}</Text>
      <View style={debugStyles.grid}>
        {scores.map(([label, value]) => (
          <View key={label} style={debugStyles.row}>
            <Text style={debugStyles.label}>{label}</Text>
            <View style={debugStyles.barTrack}>
              <View
                style={[
                  debugStyles.barFill,
                  {
                    width: `${value}%`,
                    backgroundColor: value >= 75 ? '#19C37D' : value >= 60 ? '#FFB020' : '#EC3FA4',
                  },
                ]}
              />
            </View>
            <Text style={debugStyles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main StorybookPager Component ────────────────────────────

export function StorybookPager({ storybook, themeKey = 'cinematic', storybookId, publicMode = false }: StorybookPagerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const lastIndexRef = useRef(0);
  const listRef = useRef<FlatList<StorybookPage>>(null);

  const themeConfig = getThemeConfig(themeKey);
  const themePreset = getThemePreset(themeKey);

  const handlePageChange = useCallback(
    (newIndex: number) => {
      if (newIndex === lastIndexRef.current) return;
      lastIndexRef.current = newIndex;
      setPageIndex(newIndex);

      // Haptic feedback on page change (theme-dependent)
      if (themeConfig.motion === 'fast' || themeConfig.motion === 'playful') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [themeConfig.motion],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      handlePageChange(newIndex);
    },
    [handlePageChange],
  );

  const scrollToPage = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(index, storybook.pages.length - 1));
    listRef.current?.scrollToIndex({ index: bounded, animated: !reduceMotion });
    handlePageChange(bounded);
  }, [handlePageChange, reduceMotion, storybook.pages.length]);

  const pacingMs = Number((storybook.pages[0]?.data as Record<string, unknown> | undefined)?.pacingMs ?? 4400);

  useEffect(() => {
    if (!isAutoPlaying || reduceMotion || storybook.pages.length <= 1) return;
    const timer = setTimeout(() => {
      if (pageIndex >= storybook.pages.length - 1) {
        setIsAutoPlaying(false);
        return;
      }
      scrollToPage(pageIndex + 1);
    }, Math.max(2600, Math.min(8000, pacingMs)));
    return () => clearTimeout(timer);
  }, [isAutoPlaying, pageIndex, pacingMs, reduceMotion, scrollToPage, storybook.pages.length]);

  // Active dot animation
  const dotWidth = useSharedValue(22);
  const dotOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (reduceMotion) {
      dotWidth.value = 22;
      dotOpacity.value = 1;
      return;
    }
    dotWidth.value = withTiming(22, { duration: 200, easing: Easing.out(Easing.cubic) });
    dotOpacity.value = withTiming(1, { duration: 200 });
  }, [pageIndex, reduceMotion]);

  const activeDotStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
    opacity: dotOpacity.value,
  }));

  return (
    <View style={[styles.shell, { backgroundColor: themePreset.colors.background }]}>
      <FlatList
        ref={listRef}
        data={storybook.pages}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={() => setIsAutoPlaying(false)}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item, index }) => (
          <View style={[styles.page, { width }]}>
            <PageRenderer
              page={item}
              themeConfig={themeConfig}
              themePreset={themePreset}
              index={index}
              storybookId={storybookId}
              publicMode={publicMode}
              storybook={storybook}
            />
          </View>
        )}
      />

      <Pressable
        style={[styles.autoPlayButton, { top: insets.top + 10, backgroundColor: `${themePreset.colors.surface}DD`, borderColor: `${themePreset.colors.textMuted}33` }]}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          setIsAutoPlaying((value) => !value);
        }}
        accessibilityRole="button"
        accessibilityLabel={isAutoPlaying ? 'Pause story playback' : 'Play story automatically'}
      >
        <Text style={[styles.autoPlayIcon, { color: themePreset.colors.accent }]}>{isAutoPlaying ? 'Ⅱ' : '▶'}</Text>
        <Text style={[styles.autoPlayText, { color: themePreset.colors.text }]}>{isAutoPlaying ? 'Pause' : 'Play story'}</Text>
      </Pressable>

      <View style={[styles.pageCounter, { bottom: insets.bottom + 32 }]}>
        <Text style={[styles.pageCounterText, { color: `${themePreset.colors.text}AA` }]}>
          {pageIndex + 1} / {storybook.pages.length}
        </Text>
      </View>

      {/* Page index dots */}
      <View style={[styles.dots, { bottom: insets.bottom + 12 }]}>
        {storybook.pages.map((p, index) => (
          <Pressable
            key={p.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              scrollToPage(index);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open story page ${index + 1} of ${storybook.pages.length}`}
          >
            {index === pageIndex ? (
              <Animated.View
                style={[
                  styles.dot,
                  styles.dotActive,
                  { backgroundColor: themePreset.colors.accent },
                  activeDotStyle,
                ]}
              />
            ) : (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: `${themePreset.colors.textMuted}55` },
                ]}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* Quality score debug overlay */}
      <QualityDebugOverlay score={storybook.qualityScore} preset={themePreset} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  autoPlayButton: { position: 'absolute', right: 14, zIndex: 120, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  autoPlayIcon: { fontSize: 11, fontWeight: '900' }, autoPlayText: { fontSize: 11, fontWeight: '900' },
  pageCounter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pageCounterText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    height: 7,
    borderRadius: 4,
  },
});

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
  },
});

const debugStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    zIndex: 100,
    minWidth: 180,
  },
  title: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    width: 50,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  value: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
    width: 24,
    textAlign: 'right',
  },
});