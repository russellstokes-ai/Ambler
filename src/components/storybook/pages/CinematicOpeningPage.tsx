import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage } from '../../../types';
import type { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface CinematicOpeningPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

interface MediaItem {
  uri: string;
  capturedAt?: string;
}

interface PhotoLayerProps {
  photo: MediaItem;
  index: number;
  activeIndex: number;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  caption?: string;
  textColor: string;
  overlayColor: string;
  bottomInset: number;
}

const MAX_PHOTOS = 8;

function PhotoLayer({
  photo,
  index,
  activeIndex,
  opacity,
  scale,
  caption,
  textColor,
  overlayColor,
  bottomInset,
}: PhotoLayerProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.photoLayer, animatedStyle]}
      pointerEvents={activeIndex === index ? 'auto' : 'none'}
    >
      <ImageBackground source={{ uri: photo.uri }} style={styles.photoImage}>
        <LinearGradient
          colors={['transparent', 'transparent', overlayColor]}
          style={[styles.photoOverlay, { paddingBottom: bottomInset + 50 }]}
        >
          {activeIndex === index && caption ? (
            <Text style={[styles.caption, { color: textColor }]}>
              {caption}
            </Text>
          ) : null}
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
}

export function CinematicOpeningPage({ page, themePreset }: CinematicOpeningPageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  const photos = ((page.data.media as MediaItem[]) ?? []).slice(0, MAX_PHOTOS);
  const photoCount = Math.max(1, photos.length);
  const photoDurationMs = Math.max(1800, Math.round(themePreset.motionTiming.heroMs / 3));
  const transitionMs = Math.min(900, themePreset.motionTiming.pageTransitionMs);

  const [activeIndex, setActiveIndex] = useState(0);
  const progressWidth = useSharedValue(0);

  // Fixed array of shared values — hooks-safe
  const opacities: Animated.SharedValue<number>[] = [];
  const scales: Animated.SharedValue<number>[] = [];
  for (let i = 0; i < MAX_PHOTOS; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    opacities.push(useSharedValue(i === 0 ? 1 : 0));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    scales.push(useSharedValue(1));
  }

  useEffect(() => {
    if (reduceMotion || photos.length === 0) {
      if (reduceMotion) {
        opacities.forEach(o => (o.value = 1));
      }
      return;
    }

    // Reset: only first photo visible
    opacities.forEach((o, i) => (o.value = i === 0 ? 1 : 0));
    scales.forEach(s => (s.value = 1));
    scales[0].value = 1.03;

    let stepIndex = 0;

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % photoCount;
      const prevIndex = (stepIndex - 1 + photoCount) % photoCount;

      // Fade out previous
      opacities[prevIndex].value = withTiming(0, {
        duration: transitionMs,
        easing: Easing.inOut(Easing.ease),
      });

      // Fade in current with scale
      opacities[stepIndex].value = withTiming(1, {
        duration: transitionMs,
        easing: Easing.inOut(Easing.ease),
      });

      scales[stepIndex].value = 1.03;
      scales[stepIndex].value = withTiming(1.0, {
        duration: photoDurationMs,
        easing: Easing.out(Easing.cubic),
      });

      setActiveIndex(stepIndex);
    }, photoDurationMs);

    return () => clearInterval(interval);
  }, [reduceMotion, photoCount]);

  // Progress bar animation
  useEffect(() => {
    if (reduceMotion) {
      progressWidth.value = 1;
      return;
    }

    progressWidth.value = 0;
    progressWidth.value = withRepeat(
      withTiming(1, {
        duration: photoDurationMs * photoCount,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [reduceMotion, photoCount]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const tc = themePreset.colors;

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      {photos.length > 0 ? (
        photos.map((photo, index) => (
          <PhotoLayer
            key={`${photo.uri}-${index}`}
            photo={photo}
            index={index}
            activeIndex={activeIndex}
            opacity={opacities[index]}
            scale={scales[index]}
            caption={page.subtitle}
            textColor={tc.text}
            overlayColor={tc.overlay}
            bottomInset={insets.bottom}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: tc.textMuted }]}>
            No photos yet
          </Text>
        </View>
      )}

      {/* Progress dots */}
      <View style={[styles.dotsContainer, { bottom: insets.bottom + 16 }]}>
        {photos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === activeIndex ? tc.accent : `${tc.textMuted}55`,
                width: index === activeIndex ? 22 : 7,
              },
            ]}
          />
        ))}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBarTrack, { bottom: insets.bottom + 8 }]}>
        <Animated.View
          style={[styles.progressBarFill, { backgroundColor: tc.accent }, progressStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  photoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  photoImage: {
    flex: 1,
  },
  photoOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
  },
  caption: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.88,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  progressBarTrack: {
    position: 'absolute',
    left: 22,
    right: 22,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1,
  },
});
