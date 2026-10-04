// ─── Full Screen Media Viewer ─────────────────────────────────
// Full screen image/video viewer with swipe, pinch-to-zoom,
// uploader info overlay, reactions row, and close button.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  Image,
  ImageSourcePropType,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { MediaAsset, getUploaderColor } from '../../features/media/mediaService';
import { colors } from '../../styles/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface MediaViewerProps {
  visible: boolean;
  media: MediaAsset[];
  startIndex: number;
  onClose: () => void;
  onDelete?: (item: MediaAsset) => void;
  currentUserId?: string;
  canModerate?: boolean;
  onToggleHeart?: (item: MediaAsset) => void | Promise<void>;
}


// ─── Format Time ──────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
  return `${secs}s`;
}

// ─── Viewer Item ──────────────────────────────────────────────

interface ViewerItemProps {
  item: MediaAsset;
  index: number;
  total: number;
}

function ViewerItem({ item, index, total }: ViewerItemProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  // Pinch-to-zoom would use react-native-gesture-handler pinch gesture
  // For now we support double-tap to zoom
  const handleDoubleTap = useCallback(() => {
    if (reduceMotion) return;
    if (scale.value > 1) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = withSpring(2, { damping: 15, stiffness: 150 });
    }
    Haptics.selectionAsync().catch(() => {});
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isVideo = item.mediaType === 'video';
  const uploaderColor = getUploaderColor(item.uploaderId);

  return (
    <View style={styles.viewerItem}>
      <Pressable onPress={handleDoubleTap}>
        <Animated.View style={[styles.imageWrap, animatedStyle]}>
          {isVideo ? (
            <Video
              source={{ uri: item.uri }}
              style={styles.fullImage}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay={false}
              posterSource={item.thumbnailUri ? { uri: item.thumbnailUri } : undefined}
              usePoster={Boolean(item.thumbnailUri)}
              accessibilityLabel={`Video ${index + 1} of ${total} by ${item.uploaderName}`}
            />
          ) : (
            <Image
              source={{ uri: item.uri }}
              style={styles.fullImage}
              resizeMode="contain"
              accessibilityLabel={`Photo ${index + 1} of ${total} by ${item.uploaderName}`}
            />
          )}
          {isVideo && item.durationSeconds ? (
            <View style={styles.videoDurationBadge}>
              <Text style={styles.videoDurationText}>{formatDuration(item.durationSeconds)}</Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ─── Main Viewer ──────────────────────────────────────────────

export function MediaViewer({
  visible,
  media,
  startIndex,
  onClose,
  onDelete,
  currentUserId,
  canModerate = false,
  onToggleHeart,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const flatListRef = useRef<FlatList>(null);
  const reduceMotion = useReducedMotion();

  // Reset index when opened
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(startIndex);
    }
  }, [visible, startIndex]);

  const currentItem = media[currentIndex];
  const canDelete = Boolean(currentItem && (canModerate || (currentUserId && currentItem.uploaderId === currentUserId)));

  const handleDelete = useCallback(() => {
    if (!currentItem || !onDelete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    onDelete(currentItem);
  }, [currentItem, onDelete]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (!currentItem) return null;

  const uploaderColor = getUploaderColor(currentItem.uploaderId);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Close button */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(200)}
          style={styles.closeWrap}
        >
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
        </Animated.View>

        {/* Counter */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(300)}
          style={styles.counterWrap}
        >
          <Text style={styles.counterText}>
            {currentIndex + 1} / {media.length}
          </Text>
        </Animated.View>

        {/* Image/Video FlatList (swipeable) */}
        <FlatList
          ref={flatListRef}
          data={media}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ViewerItem item={item} index={index} total={media.length} />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Bottom overlay: uploader info + reactions */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(400)}
          style={styles.bottomOverlay}
        >
          {/* Uploader info */}
          <View style={styles.uploaderRow}>
            <View style={[styles.uploaderAvatar, { backgroundColor: uploaderColor }]}>
              <Text style={styles.uploaderInitial}>
                {currentItem.uploaderName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.uploaderInfo}>
              <Text style={styles.uploaderName}>{currentItem.uploaderName}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(currentItem.capturedAt)}</Text>
            </View>
          </View>

          {/* Reactions row */}
          <View style={styles.reactionsRow}>
            <Pressable
              style={styles.reactionButton}
              onPress={() => {
                if (!onToggleHeart) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                void onToggleHeart(currentItem);
              }}
            >
              <Ionicons name="heart-outline" size={22} color="white" />
              <Text style={styles.reactionCount}>{currentItem.reactions}</Text>
            </Pressable>

            {/* Delete button for the uploader or event organiser. */}
            {canDelete && (
              <Pressable
                style={[styles.reactionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F062C',
  },
  closeWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    left: 20,
    zIndex: 10,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  viewerItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  videoDurationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(15,6,44,0.6)',
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  uploaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploaderInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  uploaderInfo: {
    gap: 2,
  },
  uploaderName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  timestamp: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionCount: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
});