import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';

import { GradientButton } from '../../src/components/core/GradientButton';
import { SkeletonLoader } from '../../src/components/core/SkeletonLoader';
import { useEventStore } from '../../src/stores/eventStore';
import { getEventTypeDef, categoryMeta } from '../../src/features/events/eventTypes';
import { VibeEventRecord } from '../../src/features/events/eventService';

// ─── Event Card ───────────────────────────────────────────────

function EventCard({ event, onPress }: { event: VibeEventRecord; onPress: () => void }) {
  const typeDef = getEventTypeDef(event.type);
  const catMeta = categoryMeta[typeDef.category];
  const startDate = new Date(event.startsAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statusConfig: Record<string, { color: string; label: string }> = {
    upcoming: { color: '#FFB020', label: 'Upcoming' },
    live: { color: '#19C37D', label: 'Live now' },
    ended: { color: '#746B8C', label: 'Ended' },
    cancelled: { color: '#FF6B6B', label: 'Cancelled' },
  };
  const status = event.archived
    ? { color: '#746B8C', label: 'Archived' }
    : (statusConfig[event.status] ?? statusConfig.upcoming);

  return (
    <Pressable onPress={onPress} style={styles.cardWrap}>
      <View style={styles.card}>
        {/* Top row: type badge + status */}
        <View style={styles.cardTopRow}>
          <View style={[styles.typeBadge, { backgroundColor: catMeta.color + '22' }]}>
            <Ionicons name={typeDef.icon as any} size={12} color={catMeta.color} />
            <Text style={[styles.typeBadgeText, { color: catMeta.color }]}>
              {typeDef.label}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.statusPillText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle}>{event.title}</Text>

        {/* Meta row */}
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#746B8C" />
            <Text style={styles.metaText}>{startDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#746B8C" />
            <Text style={styles.metaText}>{event.locationLabel}</Text>
          </View>
        </View>

        {/* Bottom row: participants + media */}
        <View style={styles.cardBottom}>
          <View style={styles.participantAvatars}>
            {event.participants.slice(0, 4).map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.miniAvatar,
                  { backgroundColor: p.avatarColor, marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i },
                ]}
              >
                <Text style={styles.miniAvatarText}>
                  {p.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            ))}
            {event.participants.length > 4 && (
              <View style={[styles.miniAvatar, styles.extraAvatar, { marginLeft: -8 }]}>
                <Text style={styles.miniAvatarText}>
                  +{event.participants.length - 4}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.mediaPill}>
            <Ionicons name="images-outline" size={12} color="#5B2CFF" />
            <Text style={styles.mediaPillText}>{event.mediaCount}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Empty State ──────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="calendar-outline" size={48} color="#5B2CFF" />
      </View>
      <Text style={styles.emptyTitle}>No events yet</Text>
      <Text style={styles.emptyText}>
        Every moment uncaptured is a story untold.
      </Text>
    </View>
  );
}

function EventCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <SkeletonLoader width={118} height={24} borderRadius={12} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
        <SkeletonLoader width={82} height={24} borderRadius={12} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
      </View>
      <SkeletonLoader width="72%" height={24} borderRadius={12} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
      <View style={styles.cardMeta}>
        <SkeletonLoader width={92} height={18} borderRadius={9} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
        <SkeletonLoader width={124} height={18} borderRadius={9} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
      </View>
      <View style={styles.cardBottom}>
        <SkeletonLoader width={104} height={28} borderRadius={14} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
        <SkeletonLoader width={48} height={24} borderRadius={12} baseColor="#E8E1F8" highlightColor="#F5F0FF" />
      </View>
    </View>
  );
}

function LoadingSkeletonList() {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 80)}
          style={styles.cardWrap}
        >
          <EventCardSkeleton />
        </Animated.View>
      ))}
    </View>
  );
}

// ─── Main Events Screen ───────────────────────────────────────

export default function EventsScreen() {
  const reduceMotion = useReducedMotion();
  const { events, isLoading, initStore, refreshEvents, isInitialized } = useEventStore();
  const [showArchived, setShowArchived] = useState(false);
  const visibleEvents = useMemo(() => events.filter((event) => showArchived ? event.archived : !event.archived), [events, showArchived]);

  // Initialize on first mount
  useEffect(() => {
    if (!isInitialized) {
      initStore();
    }
  }, [isInitialized]);

  // Refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        refreshEvents();
      }
    }, [isInitialized])
  );

  const handleEventPress = (event: VibeEventRecord) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(`/event/${event.id}/lobby`);
  };

  const handleCreate = () => {
    Haptics.selectionAsync().catch(() => {});
    router.push('/event/create');
  };

  const renderItem = ({ item, index }: { item: VibeEventRecord; index: number }) => (
    <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(index * 80)}>
      <EventCard event={item} onPress={() => handleEventPress(item)} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View><Text style={styles.headerTitle}>Your events</Text><Pressable onPress={() => setShowArchived((value) => !value)}><Text style={styles.archiveToggle}>{showArchived ? 'Show active events' : 'View archive'}</Text></Pressable></View>
        <Pressable style={styles.createButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Events List */}
      <FlatList
        data={visibleEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshEvents}
            tintColor="#5B2CFF"
            colors={['#5B2CFF']}
          />
        }
        ListEmptyComponent={
          isLoading ? <LoadingSkeletonList /> : <EmptyState />
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />

      {/* Create FAB (alternative to header button) */}
      {visibleEvents.length > 0 && (
        <Pressable style={styles.fab} onPress={handleCreate}>
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  archiveToggle: { color: '#5B2CFF', fontSize: 11, fontWeight: '800', marginTop: 3 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -0.8,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B2CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 100,
  },
  skeletonList: {
    gap: 14,
  },
  cardWrap: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E1F8',
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -0.4,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: '#746B8C',
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantAvatars: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  miniAvatarText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
  },
  extraAvatar: {
    backgroundColor: '#E8E1F8',
  },
  mediaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#5B2CFF22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  mediaPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5B2CFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 14,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#5B2CFF22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#18122B',
  },
  emptyText: {
    fontSize: 15,
    color: '#746B8C',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B2CFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B2CFF',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
