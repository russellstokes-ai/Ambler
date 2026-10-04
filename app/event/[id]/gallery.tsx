// ─── Media Gallery Screen ─────────────────────────────────────
// Grid view of all event media with filter tabs, full screen viewer,
// upload button, empty state, pull to refresh, and skeleton loader.

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../src/hooks/useReducedMotion';
import { SkeletonLoader } from '../../../src/components/core/SkeletonLoader';
import { MediaGrid } from '../../../src/components/media/MediaGrid';
import { MediaViewer } from '../../../src/components/media/MediaViewer';
import { UploadButton } from '../../../src/components/media/UploadButton';
import { UploadProgress } from '../../../src/components/media/UploadProgress';
import { StatCounter } from '../../../src/components/core/StatCounter';
import { useMediaStore } from '../../../src/stores/mediaStore';
import { useEventStore } from '../../../src/stores/eventStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { MediaAsset, UploadQueueItem } from '../../../src/features/media/mediaService';
import { colors } from '../../../src/styles/theme';
import { toggleHeartReaction } from '../../../src/features/contributions/contributionService';

// ─── Filter Tabs ──────────────────────────────────────────────

type FilterTab = 'all' | 'photos' | 'videos' | 'mine';

const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'photos', label: 'Photos', icon: 'image' },
  { key: 'videos', label: 'Videos', icon: 'videocam' },
  { key: 'mine', label: 'Mine', icon: 'person' },
];

// ─── Skeleton Grid ────────────────────────────────────────────

function SkeletonGrid() {
  const items = Array.from({ length: 12 });
  return (
    <View style={styles.skeletonGrid}>
      {items.map((_, i) => (
        <SkeletonLoader
          key={i}
          width="32%"
          height={120}
          borderRadius={10}
          baseColor="rgba(232,225,248,0.6)"
          highlightColor="rgba(91,44,255,0.12)"
          style={{ marginBottom: 4 }}
        />
      ))}
    </View>
  );
}

// ─── Main Gallery Screen ──────────────────────────────────────

export default function GalleryScreen() {
  const reduceMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const {
    mediaByEvent,
    isLoadingGallery,
    loadEventMedia,
    uploadMedia,
    deleteMedia,
    isUploading,
    uploadQueue,
    initStore,
  } = useMediaStore();

  const { activeEvent, loadEventById } = useEventStore();
  const canModerate = Boolean(currentUserId && activeEvent?.participants.some((participant) => participant.id === currentUserId && participant.isOrganiser));

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadSheetVisible, setUploadSheetVisible] = useState(false);

  // Load event + media on mount
  useEffect(() => {
    if (id) {
      loadEventById(id);
      initStore().then(() => {
        loadEventMedia(id);
      });
    }
  }, [id]);

  // ─── Filtered Media ─────────────────────────────────────────

  const allMedia = useMemo(() => {
    const eventMedia = mediaByEvent[id ?? ''] ?? [];
    return [...eventMedia].sort(
      (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    );
  }, [mediaByEvent, id]);

  const filteredMedia = useMemo(() => {
    switch (activeFilter) {
      case 'photos':
        return allMedia.filter(m => m.mediaType === 'photo');
      case 'videos':
        return allMedia.filter(m => m.mediaType === 'video');
      case 'mine':
        return currentUserId ? allMedia.filter(m => m.uploaderId === currentUserId) : [];
      default:
        return allMedia;
    }
  }, [allMedia, activeFilter, currentUserId]);

  // ─── Handlers ───────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    await loadEventMedia(id);
    setRefreshing(false);
  }, [id, loadEventMedia]);

  const handleItemPress = useCallback((index: number) => {
    Haptics.selectionAsync().catch(() => {});
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

  const handleItemLongPress = useCallback((item: MediaAsset) => {
    const isOwn = item.uploaderId === currentUserId;
    const canDeleteItem = isOwn || canModerate;
    const options: string[] = [];

    if (canDeleteItem) {
      options.push('Delete');
    }
    options.push('React ❤️');
    options.push('Cancel');

    Alert.alert(
      'Options',
      `${item.mediaType === 'video' ? 'Video' : 'Photo'} by ${item.uploaderName}`,
      [
        ...(canDeleteItem ? [{
          text: 'Delete',
          style: 'destructive' as const,
          onPress: () => {
            Alert.alert(
              `Delete this ${item.mediaType}?`,
              'This will remove it from the event gallery.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (!id) return;
                    await deleteMedia(id, item.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  },
                },
              ]
            );
          },
        }] : []),
        {
          text: 'React ❤️',
          onPress: async () => {
            if (!id) return;
            try {
              const active = await toggleHeartReaction(id, item.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              await loadEventMedia(id);
              if (!active) {
                Haptics.selectionAsync().catch(() => {});
              }
            } catch (err) {
              Alert.alert('Could not react', err instanceof Error ? err.message : 'Try again.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [currentUserId, canModerate, id, deleteMedia, loadEventMedia]);

  const handleUploadItems = useCallback(async (items: UploadQueueItem[]) => {
    if (!id) return;
    setUploadSheetVisible(true);
    await uploadMedia(id, items);
  }, [id, uploadMedia]);

  const handleDeleteFromViewer = useCallback(async (item: MediaAsset) => {
    if (!id) return;
    await deleteMedia(id, item.id);
    setViewerVisible(false);
  }, [id, deleteMedia]);

  const handleToggleHeartFromViewer = useCallback(async (item: MediaAsset) => {
    if (!id) return;
    try {
      await toggleHeartReaction(id, item.id);
      await loadEventMedia(id);
    } catch (err) {
      Alert.alert('Could not react', err instanceof Error ? err.message : 'Try again.');
    }
  }, [id, loadEventMedia]);

  // ─── Filter counts ──────────────────────────────────────────

  const counts = useMemo(() => ({
    all: allMedia.length,
    photos: allMedia.filter(m => m.mediaType === 'photo').length,
    videos: allMedia.filter(m => m.mediaType === 'video').length,
    mine: currentUserId ? allMedia.filter(m => m.uploaderId === currentUserId).length : 0,
  }), [allMedia, currentUserId]);

  // ─── Render ─────────────────────────────────────────────────

  const eventTitle = activeEvent?.title ?? 'Gallery';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#18122B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{eventTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {allMedia.length} {allMedia.length === 1 ? 'photo' : 'photos'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(120)} style={styles.creationNote}>
        <Text style={styles.creationNoteText}>You've chosen </Text>
        <StatCounter
          value={allMedia.length}
          fontSize={14}
          color="#5B2CFF"
          fontWeight="900"
          durationMs={650}
        />
        <Text style={styles.creationNoteText}>
          {allMedia.length === 1 ? ' moment' : ' moments'}
        </Text>
      </Animated.View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = counts[tab.key];
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveFilter(tab.key);
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={isActive ? '#5B2CFF' : '#746B8C'}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <FlatList
        data={[filteredMedia]}
        keyExtractor={(_, idx) => `media_list_${idx}`}
        renderItem={({ item: media }) => (
          media.length > 0 ? (
            <MediaGrid
              media={media}
              onItemPress={handleItemPress}
              onItemLongPress={handleItemLongPress}
            />
          ) : (
            <EmptyState />
          )
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5B2CFF"
            colors={['#5B2CFF']}
          />
        }
        ListEmptyComponent={
          isLoadingGallery ? <SkeletonGrid /> : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Upload is only offered while the event can still accept contributions. */}
      {activeEvent && !activeEvent.archived && !['ended', 'cancelled'].includes(activeEvent.status) ? (
        <UploadButton onItemsSelected={handleUploadItems} />
      ) : null}

      {/* Upload Progress Sheet */}
      <UploadProgress
        visible={uploadSheetVisible}
        onClose={() => setUploadSheetVisible(false)}
        eventId={id ?? ''}
      />

      {/* Full Screen Viewer */}
      <MediaViewer
        visible={viewerVisible}
        media={filteredMedia}
        startIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
        onDelete={handleDeleteFromViewer}
        currentUserId={currentUserId ?? ''}
        canModerate={canModerate}
        onToggleHeart={handleToggleHeartFromViewer}
      />
    </SafeAreaView>
  );
}

// ─── Empty State ──────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="images-outline" size={48} color="#5B2CFF" />
      </View>
      <Text style={styles.emptyTitle}>No moments yet</Text>
      <Text style={styles.emptySubtitle}>
        Upload photos and videos so this event can become a storybook.
      </Text>
      <View style={styles.emptyCta}>
        <Ionicons name="cloud-upload-outline" size={16} color="#5B2CFF" />
        <Text style={styles.emptyCtaText}>Tap the upload button to add moments</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#18122B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#746B8C',
    fontWeight: '600',
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  creationNote: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  creationNoteText: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '800',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  tabActive: {
    backgroundColor: '#5B2CFF15',
    borderColor: '#5B2CFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#746B8C',
  },
  tabTextActive: {
    color: '#5B2CFF',
  },
  tabBadge: {
    backgroundColor: '#E8E1F8',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#5B2CFF22',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#746B8C',
  },
  tabBadgeTextActive: {
    color: '#5B2CFF',
  },
  listContent: {
    paddingBottom: 100, // Space for floating upload button
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    gap: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#5B2CFF10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#18122B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#5B2CFF12',
  },
  emptyCtaText: {
    color: '#5B2CFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
