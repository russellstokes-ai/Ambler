// ─── Media Grid Component ─────────────────────────────────────
// 3-column grid with smart chronological sorting, video overlays,
// reaction badges, uploader avatars, and tap animations.

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MediaAsset, getUploaderColor } from '../../features/media/mediaService';
import { colors } from '../../styles/theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MediaGridProps {
  media: MediaAsset[];
  onItemPress: (index: number) => void;
  onItemLongPress?: (item: MediaAsset) => void;
}

const NUM_COLUMNS = 3;
const SPACING = 4;

// ─── Grid Item ────────────────────────────────────────────────

interface GridItemProps {
  item: MediaAsset;
  index: number;
  onPress: (index: number) => void;
  onLongPress?: (item: MediaAsset) => void;
}

const GridItem = memo(function GridItem({ item, index, onPress, onLongPress }: GridItemProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!reduceMotion) {
      scale.value = withTiming(0.95, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [reduceMotion]);

  const handlePressOut = useCallback(() => {
    if (!reduceMotion) {
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [reduceMotion]);

  const handlePress = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onPress(index);
  }, [index, onPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onLongPress?.(item);
  }, [item, onLongPress]);

  const isVideo = item.mediaType === 'video';
  const isPortrait = item.height > item.width;
  const uploaderColor = getUploaderColor(item.uploaderId);
  const uploaderInitial = item.uploaderName.charAt(0).toUpperCase();

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <Animated.View style={[styles.gridItem, animatedStyle]}>
        <Image
          source={{ uri: item.thumbnailUri }}
          style={[styles.thumbnail, isPortrait && styles.thumbnailPortrait]}
          resizeMode="cover"
          accessibilityRole="imagebutton"
          accessibilityLabel={`${item.mediaType} by ${item.uploaderName}`}
        />

        {/* Gradient overlay for badge visibility */}
        <View style={styles.overlayGradient} />

        {/* Video overlay */}
        {isVideo && (
          <View style={styles.videoOverlay}>
            <View style={styles.playIconWrap}>
              <Ionicons name="play" size={16} color="white" />
            </View>
            {item.durationSeconds && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {formatDuration(item.durationSeconds)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Uploader avatar */}
        <View style={[styles.uploaderAvatar, { backgroundColor: uploaderColor }]}>
          <Text style={styles.uploaderInitial}>{uploaderInitial}</Text>
        </View>

        {/* Reactions badge */}
        {item.reactions > 0 && (
          <View style={styles.reactionsBadge}>
            <Ionicons name="heart" size={10} color="#EC3FA4" />
            <Text style={styles.reactionsText}>{item.reactions}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

// ─── Duration Formatter ───────────────────────────────────────

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
}

// ─── Main Grid ────────────────────────────────────────────────

export function MediaGrid({ media, onItemPress, onItemLongPress }: MediaGridProps) {
  // Sort by capturedAt (chronological)
  const sorted = [...media].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
  );

  return (
    <View style={styles.grid}>
      {sorted.map((item, index) => (
        <GridItem
          key={item.id}
          item={item}
          index={index}
          onPress={onItemPress}
          onLongPress={onItemLongPress}
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING,
  },
  gridItem: {
    width: `${100 / NUM_COLUMNS}%` as unknown as number,
    aspectRatio: 1,
    padding: SPACING,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#E8E1F8',
  },
  thumbnailPortrait: {
    // Same size — grid is fixed squares
  },
  overlayGradient: {
    position: 'absolute',
    bottom: SPACING,
    left: SPACING,
    right: SPACING,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  videoOverlay: {
    position: 'absolute',
    top: SPACING + 6,
    left: SPACING + 6,
    right: SPACING + 6,
    bottom: SPACING + 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  uploaderAvatar: {
    position: 'absolute',
    bottom: SPACING + 6,
    left: SPACING + 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  uploaderInitial: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  reactionsBadge: {
    position: 'absolute',
    top: SPACING + 6,
    right: SPACING + 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  reactionsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#18122B',
  },
});