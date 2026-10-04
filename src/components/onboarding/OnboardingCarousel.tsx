import React, { useCallback, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../styles/theme';
import { themePresets } from '../../styles/themePresets';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { OnboardingSlide } from './OnboardingSlide';
import { SlideIndicator } from './SlideIndicator';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type OnboardingSlideData = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: [string, string];
  secondaryLabel?: string;
  primaryLabel?: string;
};

const SLIDES: OnboardingSlideData[] = [
  {
    id: 'capture-together',
    title: "Don't let your shared moments fade.",
    subtitle: "Everyone's photos in one place, ready to become a story you can keep.",
    icon: '📸',
    gradient: [themePresets.social_story.colors.primary, themePresets.social_story.colors.secondary],
  },
  {
    id: 'premium-storybooks',
    title: "See what you'll create",
    subtitle: 'Photos, routes, and moments from your events become a storybook worth keeping.',
    icon: '📖',
    gradient: [themePresets.luxe.colors.background, themePresets.luxe.colors.accent],
    primaryLabel: 'Keep going',
  },
  {
    id: 'journey-mapped',
    title: 'Your journey, mapped',
    subtitle: 'Routes, moments, and memories, gathered into one beautiful map.',
    icon: '🗺️',
    gradient: [themePresets.route_replay.colors.background, themePresets.route_replay.colors.primary],
  },
  {
    id: 'share-story',
    title: 'Your storybook is ready.',
    subtitle: 'Sign up to create your own before the moments disappear into chat threads.',
    icon: '🔗',
    gradient: [themePresets.cinematic.colors.background, themePresets.cinematic.colors.accent],
  },
];

interface OnboardingCarouselProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

export function OnboardingCarousel({ onGetStarted, onSkip }: OnboardingCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const activeIndex = useMemo(() => Math.min(currentIndex, SLIDES.length - 1), [currentIndex]);

  const goToSlide = useCallback((index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), SLIDES.length - 1);
    Haptics.selectionAsync().catch(() => {});
    scrollRef.current?.scrollTo({
      x: nextIndex * width,
      animated: !reduceMotion,
    });

    if (reduceMotion) {
      scrollX.value = nextIndex * width;
      setCurrentIndex(nextIndex);
    }
  }, [reduceMotion, scrollX, width]);

  const handleMomentumEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  }, [width]);

  const handleNext = useCallback(() => {
    if (activeIndex === SLIDES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onGetStarted();
      return;
    }

    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide, onGetStarted]);

  const handleSkip = useCallback(() => {
    if (activeIndex === SLIDES.length - 1) {
      onSkip();
      return;
    }

    Haptics.selectionAsync().catch(() => {});
    goToSlide(SLIDES.length - 1);
  }, [activeIndex, goToSlide, onSkip]);

  return (
    <View style={styles.container}>
      <AnimatedScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={scrollHandler}
        scrollEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={{ width }}>
            <OnboardingSlide
              title={slide.title}
              subtitle={slide.subtitle}
              gradient={slide.gradient}
              icon={slide.icon}
              isLast={index === SLIDES.length - 1}
              isActive={activeIndex === index}
              onNext={handleNext}
              onSkip={handleSkip}
              secondaryLabel={slide.secondaryLabel}
              primaryLabel={slide.primaryLabel}
              showSkip={index !== SLIDES.length - 1}
              reduceMotion={reduceMotion}
            />
          </View>
        ))}
      </AnimatedScrollView>

      <SlideIndicator
        count={SLIDES.length}
        progress={scrollX}
        pageWidth={width}
        currentIndex={activeIndex}
        reduceMotion={reduceMotion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night,
  },
});
