// Home — Capture → Build → Relive dashboard.

import React, { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { GradientButton } from '../../src/components/core/GradientButton';
import { colors, gradients } from '../../src/styles/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useEventStore } from '../../src/stores/eventStore';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import { getEventTypeDef } from '../../src/features/events/eventTypes';
import type { VibeEventRecord } from '../../src/features/events/eventService';

export default function Home() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { user } = useAuthStore();
  const { events, initStore, refreshEvents, isInitialized } = useEventStore();

  const greetingOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const greetingY = useSharedValue(reduceMotion ? 0 : 20);
  const cardOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const cardY = useSharedValue(reduceMotion ? 0 : 20);

  useEffect(() => {
    if (!isInitialized) initStore().catch(() => {});
  }, [initStore, isInitialized]);

  useFocusEffect(useCallback(() => {
    if (isInitialized) refreshEvents().catch(() => {});
  }, [isInitialized, refreshEvents]));

  useEffect(() => {
    if (reduceMotion) return;
    greetingOpacity.value = withTiming(1, { duration: 500 });
    greetingY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    cardY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion]);

  const greeting = user?.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'Welcome';
  const visibleEvents = events.filter((event) => !event.archived);
  const active = visibleEvents.filter((event) => event.status === 'live' || event.status === 'upcoming');
  const recent = [...visibleEvents].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 3);

  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/event/create');
  };

  const greetingStyle = useAnimatedStyle(() => ({ opacity: greetingOpacity.value, transform: [{ translateY: greetingY.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ translateY: cardY.value }] }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
      <Animated.View style={greetingStyle}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>Capture it together. Relive the whole story.</Text>
      </Animated.View>

      <Animated.View style={cardStyle}>
        <LinearGradient colors={gradients.hero as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaCard}>
          <View style={styles.capturePill}><Ionicons name="camera-outline" size={13} color="white" /><Text style={styles.capturePillText}>CAPTURE → BUILD → RELIVE</Text></View>
          <Text style={styles.ctaTitle}>Start a new story</Text>
          <Text style={styles.ctaDescription}>Invite your people, gather everyone’s view, then let Ambler build the finished story.</Text>
          <View style={styles.ctaButtonWrap}><GradientButton label="Create Event" onPress={handleCreateEvent} /></View>
        </LinearGradient>
      </Animated.View>

      {active.length > 0 ? (
        <View style={styles.liveStrip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{active.length === 1 ? `${active[0]!.title} is active` : `${active.length} active stories`}</Text>
          <Pressable onPress={() => router.push('/events')}><Text style={styles.liveAction}>Open</Text></Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{recent.length ? 'Your latest stories' : 'Your stories'}</Text>
        {visibleEvents.length > 0 ? <Pressable onPress={() => router.push('/events')}><Text style={styles.viewAll}>View all</Text></Pressable> : null}
      </View>

      {recent.length ? (
        <View style={styles.storyList}>
          {recent.map((event) => <HomeStoryCard key={event.id} event={event} />)}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Ionicons name="sparkles-outline" size={42} color={colors.purple} /></View>
          <Text style={styles.emptyTitle}>Your stories start here</Text>
          <Text style={styles.emptyDescription}>Create an event, invite friends, and Ambler will turn everyone’s moments into one story.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function HomeStoryCard({ event }: { event: VibeEventRecord }) {
  const type = getEventTypeDef(event.type);
  const date = new Date(event.startsAt).toLocaleDateString([], { day: 'numeric', month: 'short' });
  const status = event.status === 'ended' ? 'Relive' : event.status === 'live' ? 'Live' : 'Upcoming';
  return (
    <Pressable style={({ pressed }) => [styles.storyCard, pressed && { transform: [{ scale: 0.99 }] }]} onPress={() => router.push(`/event/${event.id}/lobby`)}>
      <View style={styles.storyIcon}><Ionicons name={type.icon as any} size={20} color={colors.purple} /></View>
      <View style={styles.storyBody}>
        <Text style={styles.storyTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.storyMeta}>{date} · {event.mediaCount} moments · {event.participants.length} people</Text>
      </View>
      <View style={styles.storyStatus}><Text style={styles.storyStatusText}>{status}</Text></View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.soft },
  content: { paddingHorizontal: 20, paddingBottom: 36, gap: 18 },
  greeting: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 16, fontWeight: '700', marginTop: 4 },
  ctaCard: { borderRadius: 30, padding: 24, gap: 14, overflow: 'hidden' },
  capturePill: { alignSelf: 'flex-start', flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)' },
  capturePillText: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  ctaTitle: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  ctaDescription: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  ctaButtonWrap: { marginTop: 8 },
  liveStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#E8FFF3', borderRadius: 16, borderWidth: 1, borderColor: '#BFEFD6' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#19C37D' }, liveText: { flex: 1, color: '#176B48', fontSize: 13, fontWeight: '800' }, liveAction: { color: '#176B48', fontSize: 12, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' }, viewAll: { color: colors.purple, fontSize: 13, fontWeight: '900' },
  storyList: { gap: 10 }, storyCard: { backgroundColor: 'white', borderRadius: 18, padding: 13, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 11 }, storyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EFE9FF', alignItems: 'center', justifyContent: 'center' }, storyBody: { flex: 1, gap: 3 }, storyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' }, storyMeta: { color: colors.muted, fontSize: 11, fontWeight: '700' }, storyStatus: { paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.soft, borderRadius: 10 }, storyStatusText: { color: colors.purple, fontSize: 10, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 }, emptyIcon: { width: 84, height: 84, borderRadius: 28, backgroundColor: '#5B2CFF14', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }, emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' }, emptyDescription: { color: colors.muted, fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
});
