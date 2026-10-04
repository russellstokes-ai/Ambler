import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../src/hooks/useReducedMotion';

import { GradientButton } from '../../../src/components/core/GradientButton';
import { QRCodeDisplay } from '../../../src/components/event/QRCodeDisplay';
import { ErrorState } from '../../../src/components/core/ErrorState';
import { StorybookGenerationProgress } from '../../../src/components/storybook/StorybookGenerationProgress';
import { useEventStore } from '../../../src/stores/eventStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { getEventTypeDef, categoryMeta } from '../../../src/features/events/eventTypes';
import { colors } from '../../../src/styles/theme';
import { eventInviteUrl } from '../../../src/config/links';

// ─── Participant Avatar ───────────────────────────────────────

function ParticipantAvatar({ name, color, isOrganiser, mediaCount }: {
  name: string;
  color: string;
  isOrganiser: boolean;
  mediaCount: number;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View style={styles.participantRow}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.participantInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.participantName}>{name}</Text>
          {isOrganiser && (
            <View style={styles.organiserBadge}>
              <Text style={styles.organiserText}>ORGANISER</Text>
            </View>
          )}
        </View>
        <Text style={styles.mediaCount}>
          {mediaCount} {mediaCount === 1 ? 'photo' : 'photos'}
        </Text>
      </View>
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    upcoming: { color: '#FFB020', label: 'Not started', icon: 'time-outline' },
    live: { color: '#19C37D', label: 'Live now', icon: 'radio-button-on' },
    ended: { color: '#746B8C', label: 'Ended', icon: 'checkmark-circle-outline' },
    cancelled: { color: '#FF6B6B', label: 'Cancelled', icon: 'close-circle-outline' },
  };

  const config = statusConfig[status] ?? statusConfig.upcoming;

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + '22' }]}>
      <Ionicons name={config.icon as any} size={14} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

// ─── Main Lobby Screen ───────────────────────────────────────

export default function EventLobbyScreen() {
  const reduceMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    activeEvent,
    loadEventById,
    endEvent,
    leaveEvent,
    archiveEvent,
    removeEvent,
  } = useEventStore();

  const currentUser = useAuthStore((state) => state.user);
  const isOrganiser = activeEvent?.participants.find(p => p.isOrganiser)?.id === currentUser?.id;
  const [isEndingEvent, setIsEndingEvent] = useState(false);
  const [endEventError, setEndEventError] = useState(false);
  const [storyLength, setStoryLength] = useState<'short' | 'standard' | 'epic'>('standard');

  // Load event on mount
  useEffect(() => {
    if (id) {
      loadEventById(id);
    }
  }, [id]);

  const handleShare = async () => {
    if (!activeEvent) return;
    Haptics.selectionAsync().catch(() => {});
    const link = eventInviteUrl(activeEvent.inviteCode);
    try {
      await Share.share({
        message: `Join "${activeEvent.title}" on Ambler. Use code ${activeEvent.inviteCode} or tap: ${link}`,
        url: link,
      });
    } catch {}
  };

  const handleEndEvent = () => {
    if (!activeEvent) return;
    Alert.alert(
      'Create the storybook?',
      `This will close "${activeEvent.title}" so guests can no longer add photos. Ambler will build a ${storyLength} story.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create storybook',
          style: 'destructive',
          onPress: async () => {
            if (!activeEvent) return;
            setIsEndingEvent(true);
            setEndEventError(false);
            try {
              const updated = await endEvent(activeEvent.id, storyLength);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setIsEndingEvent(false);
              // Navigate to the storybook viewer for this event
              router.push(`/storybook/${activeEvent.id}`);
            } catch (err) {
              setIsEndingEvent(false);
              setEndEventError(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            }
          },
        },
      ]
    );
  };

  const handleArchiveEvent = () => {
    if (!activeEvent) return;
    const nextArchived = !activeEvent.archived;
    Alert.alert(
      nextArchived ? 'Archive event?' : 'Restore event?',
      nextArchived ? 'This hides the event from your main event list. Its story and media are kept.' : 'This puts the event back in your main list.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: nextArchived ? 'Archive' : 'Restore', onPress: async () => { await archiveEvent(activeEvent.id, nextArchived); Haptics.selectionAsync().catch(() => {}); } },
      ],
    );
  };

  const handleDeleteEvent = () => {
    if (!activeEvent) return;
    Alert.alert(
      'Delete event permanently?',
      'This removes the event, its story, captions, route and stored media records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently', style: 'destructive', onPress: async () => {
            const ok = await removeEvent(activeEvent.id);
            if (ok) router.replace('/(tabs)/events');
            else Alert.alert('Delete failed', 'Ambler could not delete this event.');
          },
        },
      ],
    );
  };

  const handleLeaveEvent = () => {
    if (!activeEvent) return;
    Alert.alert(
      'Leave event?',
      `You will no longer be able to add photos to "${activeEvent.title}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            if (!activeEvent) return;
            await leaveEvent(activeEvent.id);
            router.replace('/(tabs)/events');
          },
        },
      ]
    );
  };

  if (!activeEvent) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Loading event...</Text>
      </SafeAreaView>
    );
  }

  // Show loading overlay while ending event
  if (isEndingEvent) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#5B2CFF" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingText}>Creating your storybook...</Text>
        <StorybookGenerationProgress compact />
        <Text style={styles.loadingSubtext}>
          You chose the moments. Now we are setting the mood and composing the pages.
        </Text>
      </SafeAreaView>
    );
  }

  // Show error state if storybook generation failed
  if (endEventError) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ErrorState
          title="Storybook not created"
          message="We could not finish this storybook. Try again in a moment."
          onRetry={() => {
            setEndEventError(false);
            if (activeEvent) {
              setIsEndingEvent(true);
              endEvent(activeEvent.id, storyLength).then((updated) => {
                setIsEndingEvent(false);
                router.push(`/storybook/${activeEvent.id}`);
              }).catch(() => {
                setIsEndingEvent(false);
                setEndEventError(true);
              });
            }
          }}
        />
      </SafeAreaView>
    );
  }

  const typeDef = getEventTypeDef(activeEvent.type);
  const catMeta = categoryMeta[typeDef.category];
  const themeLabel = activeEvent.theme.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const startDate = new Date(activeEvent.startsAt).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#18122B" />
        </Pressable>
        <Text style={styles.headerTitle}>Event lobby</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Header Card */}
        <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(100)} style={styles.eventHeaderCard}>
          <View style={[styles.typeBadge, { backgroundColor: catMeta.color + '22' }]}>
            <Ionicons name={typeDef.icon as any} size={14} color={catMeta.color} />
            <Text style={[styles.typeBadgeText, { color: catMeta.color }]}>
              {typeDef.label}
            </Text>
          </View>

          <Text style={styles.eventTitle}>{activeEvent.title}</Text>

          {activeEvent.description ? (
            <Text style={styles.eventDescription}>{activeEvent.description}</Text>
          ) : null}

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color="#746B8C" />
            <Text style={styles.metaText}>{startDate}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#746B8C" />
            <Text style={styles.metaText}>{activeEvent.locationLabel}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="color-palette-outline" size={16} color="#746B8C" />
            <Text style={styles.metaText}>{themeLabel} theme</Text>
          </View>

          <View style={styles.statusRow}>
            <StatusBadge status={activeEvent.status} />
            {isOrganiser && (
              <View style={styles.organiserPill}>
                <Ionicons name="star" size={12} color="#FFB020" />
                <Text style={styles.organiserPillText}>You're organising</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Media Count */}
        <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(200)} style={styles.sectionCard}>
          <View style={styles.mediaCountRow}>
            <View style={styles.mediaIconWrap}>
              <Ionicons name="images-outline" size={24} color="#5B2CFF" />
            </View>
            <View>
              <Text style={styles.mediaCountNumber}>{activeEvent.mediaCount}</Text>
              <Text style={styles.mediaCountLabel}>
              {activeEvent.mediaCount === 0 ? 'No photos yet' : 'photos added'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Event hub actions */}
        <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(260)} style={styles.hubActions}>
          <Pressable style={styles.hubAction} onPress={() => router.push(`/event/${activeEvent.id}/gallery`)}>
            <View style={styles.hubActionIcon}>
              <Ionicons name="images-outline" size={22} color="#5B2CFF" />
            </View>
            <View style={styles.hubActionCopy}>
              <Text style={styles.hubActionTitle}>Moments</Text>
              <Text style={styles.hubActionMeta}>See and add the group’s photos and videos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A59CB8" />
          </Pressable>
          <Pressable style={styles.hubAction} onPress={() => router.push(`/event/${activeEvent.id}/route`)}>
            <View style={styles.hubActionIcon}>
              <Ionicons name="map-outline" size={22} color="#5B2CFF" />
            </View>
            <View style={styles.hubActionCopy}>
              <Text style={styles.hubActionTitle}>Route Replay</Text>
              <Text style={styles.hubActionMeta}>Capture or revisit the event journey</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A59CB8" />
          </Pressable>
        </Animated.View>

        {/* Participants */}
        <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(300)} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Guests ({activeEvent.participants.length})
            </Text>
            <Ionicons name="people-circle-outline" size={22} color="#5B2CFF" />
          </View>
          <View style={styles.participantsList}>
            {activeEvent.participants.map((p, index) => (
              <Animated.View
                key={p.id}
                entering={reduceMotion ? undefined : FadeInDown.delay(80 + index * 45)}
              >
                <ParticipantAvatar
                  name={p.name}
                  color={p.avatarColor}
                  isOrganiser={p.isOrganiser}
                  mediaCount={p.mediaCount}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Invite Section */}
        {activeEvent.status !== 'ended' && (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(400)} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Invite guests</Text>
              <Ionicons name="qr-code-outline" size={22} color="#5B2CFF" />
            </View>
            <QRCodeDisplay
              inviteCode={activeEvent.inviteCode}
              inviteLink={eventInviteUrl(activeEvent.inviteCode)}
            />
            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="white" />
              <Text style={styles.shareButtonText}>Share invite</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Storybook Link (if ended) */}
        {activeEvent.status === 'ended' && activeEvent.storybookId && (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(400)} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Storybook ready</Text>
              <Ionicons name="book-outline" size={22} color="#19C37D" />
            </View>
            <Text style={styles.storybookReady}>
              Your storybook is ready to relive and share.
            </Text>
            <GradientButton
              label="Open storybook"
              onPress={() => router.push(`/storybook/${activeEvent.id}`)}
            />
          </Animated.View>
        )}

        {/* Organiser / Guest Controls */}
        <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(500)} style={styles.controlsCard}>
          {isOrganiser ? (
            activeEvent.status !== 'ended' ? (
              <View style={styles.organiserControls}>
                <View style={styles.storyLengthCard}>
                  <Text style={styles.storyLengthTitle}>Story length</Text>
                  <Text style={styles.storyLengthMeta}>Choose the pacing before Ambler builds the final story.</Text>
                  <View style={styles.storyLengthRow}>
                    {(['short', 'standard', 'epic'] as const).map((length) => (
                      <Pressable
                        key={length}
                        onPress={() => setStoryLength(length)}
                        style={[styles.storyLengthChip, storyLength === length && styles.storyLengthChipActive]}
                      >
                        <Text style={[styles.storyLengthChipText, storyLength === length && styles.storyLengthChipTextActive]}>
                          {length === 'short' ? 'Short' : length === 'standard' ? 'Standard' : 'Epic'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Pressable style={styles.endButton} onPress={handleEndEvent}>
                  <Ionicons name="stop-circle-outline" size={20} color="#FF6B6B" />
                  <Text style={styles.endButtonText}>Create storybook</Text>
                </Pressable>
                <Pressable style={styles.archiveButton} onPress={handleArchiveEvent}>
                  <Ionicons name={activeEvent.archived ? 'archive-outline' : 'archive'} size={18} color="#5B2CFF" />
                  <Text style={styles.archiveButtonText}>{activeEvent.archived ? 'Restore from archive' : 'Archive event'}</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={handleDeleteEvent}>
                  <Ionicons name="trash-outline" size={18} color="#B4233F" />
                  <Text style={styles.deleteButtonText}>Delete permanently</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.organiserControls}>
                <Pressable style={styles.archiveButton} onPress={handleArchiveEvent}><Ionicons name="archive" size={18} color="#5B2CFF" /><Text style={styles.archiveButtonText}>{activeEvent.archived ? 'Restore from archive' : 'Archive event'}</Text></Pressable>
                <Pressable style={styles.deleteButton} onPress={handleDeleteEvent}><Ionicons name="trash-outline" size={18} color="#B4233F" /><Text style={styles.deleteButtonText}>Delete permanently</Text></Pressable>
              </View>
            )
          ) : (
            activeEvent.status !== 'ended' && (
              <Pressable style={styles.leaveButton} onPress={handleLeaveEvent}>
                <Ionicons name="exit-outline" size={20} color="#FF6B6B" />
                <Text style={styles.leaveButtonText}>Leave event</Text>
              </Pressable>
            )
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F4FF',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#F7F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#746B8C',
    fontWeight: '700',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#A098B8',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18122B',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  eventHeaderCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  eventDescription: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '600',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  organiserPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  organiserPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFB020',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#18122B',
  },
  mediaCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mediaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#5B2CFF22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCountNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -1,
  },
  mediaCountLabel: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '600',
  },
  hubActions: {
    gap: 10,
  },
  hubAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  hubActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0EAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubActionCopy: { flex: 1, gap: 2 },
  hubActionTitle: { color: '#18122B', fontSize: 15, fontWeight: '900' },
  hubActionMeta: { color: '#746B8C', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  participantsList: {
    gap: 14,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  participantInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18122B',
  },
  organiserBadge: {
    backgroundColor: '#FFF9E6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  organiserText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFB020',
    letterSpacing: 0.5,
  },
  mediaCount: {
    fontSize: 12,
    color: '#746B8C',
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#18C7D5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  storybookReady: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 14,
  },
  controlsCard: {
    gap: 8,
  },
  organiserControls: { gap: 12 },
  storyLengthCard: { backgroundColor: '#FBF9FF', borderWidth: 1, borderColor: '#E8E1F8', borderRadius: 18, padding: 14, gap: 8 },
  storyLengthTitle: { color: '#18122B', fontSize: 14, fontWeight: '900' },
  storyLengthMeta: { color: '#746B8C', fontSize: 11, fontWeight: '600', lineHeight: 16 },
  storyLengthRow: { flexDirection: 'row', gap: 8 },
  storyLengthChip: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12, backgroundColor: '#F4F0FB', borderWidth: 1, borderColor: '#E8E1F8' },
  storyLengthChipActive: { backgroundColor: '#5B2CFF', borderColor: '#5B2CFF' },
  storyLengthChipText: { color: '#746B8C', fontSize: 11, fontWeight: '900' },
  storyLengthChipTextActive: { color: '#FFFFFF' },
  archiveButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: '#F0EAFE' },
  archiveButtonText: { color: '#5B2CFF', fontSize: 12, fontWeight: '900' },
  deleteButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: '#FFF0F3' },
  deleteButtonText: { color: '#B4233F', fontSize: 12, fontWeight: '900' },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B22',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B22',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF6B6B',
  },
});
