import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import type { Storybook, ThemeKey } from '../../types';
import { getThemePreset } from '../../styles/themePresets';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface StoryReadyRevealProps {
  storybook: Storybook;
  themeKey: ThemeKey;
  onOpen: () => void;
}

function coverImage(storybook: Storybook): string | undefined {
  const cover = storybook.pages.find((page) => page.type === 'cover');
  const hero = cover?.data?.heroMedia as { uri?: string } | undefined;
  return hero?.uri;
}

export function StoryReadyReveal({ storybook, themeKey, onOpen }: StoryReadyRevealProps) {
  const reduceMotion = useReducedMotion();
  const preset = getThemePreset(themeKey);
  const heroUri = coverImage(storybook);

  const veil = useSharedValue(reduceMotion ? 1 : 0);
  const titleOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const titleY = useSharedValue(reduceMotion ? 0 : 24);
  const buttonOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    veil.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    titleOpacity.value = withDelay(350, withTiming(1, { duration: 650 }));
    titleY.value = withDelay(350, withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) }));
    buttonOpacity.value = withDelay(950, withTiming(1, { duration: 450 }));
    const haptic = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 950);
    return () => clearTimeout(haptic);
  }, [reduceMotion]);

  const veilStyle = useAnimatedStyle(() => ({ opacity: veil.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onOpen();
  };

  return (
    <View style={styles.container}>
      {heroUri ? <Image source={{ uri: heroUri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <Animated.View style={[StyleSheet.absoluteFill, veilStyle]}>
        <LinearGradient
          colors={heroUri ? ['rgba(5,2,18,0.28)', 'rgba(10,4,32,0.72)', '#0A0420'] : [preset.colors.primary, '#24104A', '#0A0420']}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={[styles.copy, titleStyle]}>
          <View style={styles.readyPill}>
            <Ionicons name="sparkles" size={13} color="white" />
            <Text style={styles.readyPillText}>YOUR STORY IS READY</Text>
          </View>
          <Text style={styles.brand}>AMBLER</Text>
          <Text style={styles.title}>{storybook.title}</Text>
          <Text style={styles.subtitle}>
            {storybook.pages.length} chapters shaped from the moments everyone brought together.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonWrap, buttonStyle]}>
          <Pressable onPress={open} style={({ pressed }) => [styles.openButton, pressed && styles.openButtonPressed]}>
            <Text style={styles.openButtonText}>Relive the story</Text>
            <Ionicons name="arrow-forward" size={20} color="#18122B" />
          </Pressable>
          <Text style={styles.hint}>Swipe through it like a living memory book.</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0420', overflow: 'hidden' },
  content: { flex: 1, paddingHorizontal: 26, paddingTop: 72, paddingBottom: 46, justifyContent: 'space-between' },
  copy: { maxWidth: 620 },
  readyPill: { alignSelf: 'flex-start', flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  readyPillText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  brand: { color: 'rgba(255,255,255,0.66)', fontSize: 12, fontWeight: '900', letterSpacing: 3.2, marginTop: 28 },
  title: { color: 'white', fontSize: 46, lineHeight: 50, fontWeight: '900', letterSpacing: -1.2, marginTop: 10 },
  subtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 24, fontWeight: '600', marginTop: 14, maxWidth: 520 },
  buttonWrap: { gap: 12 },
  openButton: { minHeight: 60, backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  openButtonPressed: { transform: [{ scale: 0.99 }], opacity: 0.94 },
  openButtonText: { color: '#18122B', fontSize: 17, fontWeight: '900' },
  hint: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
