// ─── Upload Progress Bottom Sheet ─────────────────────────────
// Shows upload queue progress with per-item progress bars,
// cancel, retry, and auto-dismiss when complete.

import React, { useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { UploadQueueItem } from '../../features/media/mediaService';
import { useMediaStore } from '../../stores/mediaStore';
import { colors } from '../../styles/theme';

interface UploadProgressProps {
  visible: boolean;
  onClose: () => void;
  eventId: string;
}

// ─── Progress Bar ─────────────────────────────────────────────

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      width.value = progress;
    } else {
      width.value = withTiming(progress, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as unknown as number,
  }));

  const barColor =
    status === 'failed' ? '#FF6B6B' :
    status === 'uploaded' ? '#19C37D' :
    status === 'cancelled' ? '#746B8C' :
    '#5B2CFF';

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { backgroundColor: barColor }, animatedStyle]} />
    </View>
  );
}

// ─── Upload Item Row ──────────────────────────────────────────

function UploadItemRow({
  item,
  onCancel,
  onRetry,
}: {
  item: UploadQueueItem;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    queued: { color: '#746B8C', label: 'Queued', icon: 'time-outline' },
    uploading: { color: '#5B2CFF', label: 'Uploading', icon: 'cloud-upload' },
    uploaded: { color: '#19C37D', label: 'Done', icon: 'checkmark-circle' },
    failed: { color: '#FF6B6B', label: 'Failed', icon: 'alert-circle' },
    cancelled: { color: '#746B8C', label: 'Cancelled', icon: 'close-circle' },
  };

  const config = statusConfig[item.status] ?? statusConfig.queued;

  return (
    <View style={styles.itemRow}>
      <Image
        source={{ uri: item.thumbnailUri ?? item.uri }}
        style={styles.itemThumbnail}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemFilename} numberOfLines={1}>
          {item.filename}
        </Text>
        <View style={styles.statusRow}>
          <Ionicons name={config.icon as any} size={12} color={config.color} />
          <Text style={[styles.statusText, { color: config.color }]}>
            {config.label}
            {item.status === 'uploading' && ` ${Math.round(item.progress)}%`}
          </Text>
        </View>
        <ProgressBar progress={item.progress} status={item.status} />
      </View>

      {/* Action button */}
      {item.status === 'uploading' && (
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onCancel(item.mediaId);
          }}
        >
          <Ionicons name="close" size={18} color="#FF6B6B" />
        </Pressable>
      )}
      {item.status === 'failed' && (
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onRetry(item.mediaId);
          }}
        >
          <Ionicons name="refresh" size={18} color="#5B2CFF" />
        </Pressable>
      )}
      {item.status === 'uploaded' && (
        <View style={styles.actionButton}>
          <Ionicons name="checkmark" size={18} color="#19C37D" />
        </View>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function UploadProgress({ visible, onClose, eventId }: UploadProgressProps) {
  const reduceMotion = useReducedMotion();
  const { uploadQueue, cancelUpload, retryFailed, isUploading } = useMediaStore();

  // Haptic on all complete
  const wasUploading = React.useRef(false);
  useEffect(() => {
    if (isUploading) {
      wasUploading.current = true;
    } else if (wasUploading.current) {
      wasUploading.current = false;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [isUploading]);

  // Auto-dismiss when all complete
  const allComplete = useMemo(() => {
    if (uploadQueue.length === 0) return true;
    return uploadQueue.every(
      item => item.status === 'uploaded' || item.status === 'cancelled'
    );
  }, [uploadQueue]);

  useEffect(() => {
    if (visible && allComplete && uploadQueue.length > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, allComplete, uploadQueue.length, onClose]);

  const activeCount = uploadQueue.filter(
    q => q.status === 'uploading' || q.status === 'queued'
  ).length;
  const failedCount = uploadQueue.filter(q => q.status === 'failed').length;
  const completedCount = uploadQueue.filter(q => q.status === 'uploaded').length;
  const totalCount = uploadQueue.length;

  const overallProgress = totalCount > 0
    ? uploadQueue.reduce((sum, q) => {
        if (q.status === 'uploaded') return sum + 100;
        if (q.status === 'failed' || q.status === 'cancelled') return sum + 100;
        return sum + q.progress;
      }, 0) / totalCount
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>
                {activeCount > 0
                  ? `Uploading ${activeCount} ${activeCount === 1 ? 'item' : 'items'}`
                  : failedCount > 0
                  ? `${failedCount} failed`
                  : 'Uploads complete'}
              </Text>
              <Text style={styles.subtitle}>
                {completedCount}/{totalCount} completed
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="chevron-down" size={22} color="#746B8C" />
            </Pressable>
          </View>

          {/* Overall progress bar */}
          {activeCount > 0 && (
            <View style={styles.overallProgressWrap}>
              <ProgressBar progress={overallProgress} status="uploading" />
            </View>
          )}

          {/* Retry all button */}
          {failedCount > 0 && (
            <Pressable
              style={styles.retryAllButton}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                retryFailed(eventId);
              }}
            >
              <Ionicons name="refresh" size={16} color="#5B2CFF" />
              <Text style={styles.retryAllText}>Retry all failed</Text>
            </Pressable>
          )}

          {/* Queue list */}
          <FlatList
            data={uploadQueue}
            keyExtractor={(item) => item.mediaId}
            renderItem={({ item }) => (
              <UploadItemRow
                item={item}
                onCancel={cancelUpload}
                onRetry={() => retryFailed(eventId)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,6,44,0.4)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E1F8',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#18122B',
  },
  subtitle: {
    fontSize: 13,
    color: '#746B8C',
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallProgressWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  retryAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryAllText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5B2CFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  itemThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E8E1F8',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemFilename: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18122B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E1F8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4FF',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E1F8',
  },
});