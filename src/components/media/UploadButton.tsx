// ─── Upload Button ────────────────────────────────────────────
// Floating action button with upload icon.
// Uses expo-image-picker for multi-select (up to 20).

import React, { useCallback, useState } from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { pickMedia, assetsToQueueItems, UploadQueueItem } from '../../features/media/mediaService';
import { gradients } from '../../styles/theme';

interface UploadButtonProps {
  onItemsSelected: (items: UploadQueueItem[]) => void;
  maxSelection?: number;
  mode?: 'floating' | 'inline';
  label?: string;
}

export function UploadButton({ onItemsSelected, maxSelection = 20, mode = 'floating', label = 'Add photos & videos' }: UploadButtonProps) {
  const reduceMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    if (!reduceMotion) {
      scale.value = withTiming(0.9, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [reduceMotion]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    if (!reduceMotion) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [reduceMotion]);

  const handlePress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const assets = await pickMedia(maxSelection);
    if (!assets || assets.length === 0) return;

    const items = assetsToQueueItems(assets);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onItemsSelected(items);
  }, [maxSelection, onItemsSelected]);

  const inline = mode === 'inline';

  return (
    <Animated.View style={[inline ? styles.inlineContainer : styles.container, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.pressable, inline && styles.inlinePressable]}
      >
        <LinearGradient
          colors={gradients.vibe as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, inline && styles.inlineButton]}
        >
          <Ionicons name="cloud-upload" size={inline ? 20 : 26} color="white" />
          {inline ? <Text style={styles.inlineLabel}>{label}</Text> : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 100,
  },
  pressable: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  inlineContainer: {
    width: '100%',
  },
  inlinePressable: {
    width: '100%',
    borderRadius: 18,
  },
  inlineButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
  },
  inlineLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B2CFF',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});