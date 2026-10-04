import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage } from '../../../types';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface HeroGalleryPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

interface MediaItem {
  uri: string;
  width?: number;
  height?: number;
  uploaderName?: string;
  reactions?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_GAP = 10;
const COLUMN_COUNT = 2;
const COLUMN_WIDTH = (screenWidth - 44 - COLUMN_GAP) / COLUMN_COUNT;

export function HeroGalleryPage({ page, themePreset }: HeroGalleryPageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  const photos = (page.data.media as MediaItem[]) ?? [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const tc = themePreset.colors;
  const cardRadius = themePreset.card.borderRadius;

  // Split into 2 columns
  const leftColumn = photos.filter((_, i) => i % 2 === 0);
  const rightColumn = photos.filter((_, i) => i % 2 === 1);

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text
          style={[
            styles.title,
            {
              color: tc.text,
              fontSize: themePreset.typography.titleSize * 0.7,
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
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: themePreset.preview.motif === 'whitespace' ? 32 : 22,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.masonry}>
          <View style={styles.column}>
            {leftColumn.map((photo, i) => {
              const globalIndex = i * 2;
              return (
                <GalleryItem
                  key={globalIndex}
                  photo={photo}
                  index={globalIndex}
                  preset={themePreset}
                  reduceMotion={reduceMotion}
                  cardRadius={cardRadius}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setExpandedIndex(globalIndex);
                  }}
                />
              );
            })}
          </View>
          <View style={styles.column}>
            {rightColumn.map((photo, i) => {
              const globalIndex = i * 2 + 1;
              return (
                <GalleryItem
                  key={globalIndex}
                  photo={photo}
                  index={globalIndex}
                  preset={themePreset}
                  reduceMotion={reduceMotion}
                  cardRadius={cardRadius}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setExpandedIndex(globalIndex);
                  }}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Full-screen viewer */}
      <Modal
        visible={expandedIndex !== null}
        transparent
        animationType="none"
        onRequestClose={() => setExpandedIndex(null)}
      >
        {expandedIndex !== null && (
          <ExpandedPhoto
            uri={photos[expandedIndex]?.uri}
            reduceMotion={reduceMotion}
            onClose={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setExpandedIndex(null);
            }}
          />
        )}
      </Modal>
    </View>
  );
}

interface ExpandedPhotoProps {
  uri?: string;
  reduceMotion: boolean;
  onClose: () => void;
}

function ExpandedPhoto({ uri, reduceMotion, onClose }: ExpandedPhotoProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.94);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable style={styles.fullscreen} onPress={onClose}>
      <Animated.Image
        source={{ uri }}
        style={[styles.fullscreenImage, animatedStyle]}
        resizeMode="contain"
      />
    </Pressable>
  );
}

interface GalleryItemProps {
  photo: MediaItem;
  index: number;
  preset: ThemePreset;
  reduceMotion: boolean;
  cardRadius: number;
  onPress: () => void;
}

function GalleryItem({ photo, index, preset, reduceMotion, cardRadius, onPress }: GalleryItemProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.95);

  const delayMs = index * 50;

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delayMs, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Vary height for masonry effect
  const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1;
  const itemHeight = aspectRatio > 1.2 ? COLUMN_WIDTH / aspectRatio : COLUMN_WIDTH * 1.2;

  return (
    <Pressable
      onPress={onPress}
      style={{ marginBottom: COLUMN_GAP, transform: [{ rotate: getGalleryRotation(preset, index) }] }}
    >
      <Animated.View
        style={[
          {
            width: COLUMN_WIDTH,
            height: itemHeight,
            borderRadius: cardRadius,
            overflow: 'hidden',
            borderWidth: preset.preview.motif === 'grain' ? 8 : preset.card.borderWidth,
            borderColor: preset.preview.motif === 'grain' ? preset.colors.surface : preset.card.borderColor,
            backgroundColor: preset.colors.surface,
            shadowColor: preset.preview.motif === 'neon' ? preset.colors.accent : preset.colors.primary,
            shadowOpacity: preset.card.shadowOpacity,
            shadowRadius: preset.card.shadowRadius,
            shadowOffset: { width: 0, height: 8 },
          },
          animatedStyle,
        ]}
      >
        <Image source={{ uri: photo.uri }} style={styles.image} />
      </Animated.View>
    </Pressable>
  );
}

function getGalleryRotation(preset: ThemePreset, index: number): string {
  if (preset.preview.motif === 'neon') return index % 2 === 0 ? '-2deg' : '2deg';
  if (preset.preview.motif === 'grain') return index % 2 === 0 ? '1deg' : '-1deg';
  if (preset.preview.motif === 'keepsake') return index % 3 === 0 ? '-1deg' : '0deg';
  return '0deg';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  masonry: {
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },
  column: {
    flex: 1,
    gap: COLUMN_GAP,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenWidth * 1.3,
  },
});
