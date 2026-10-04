import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { EventType, Storybook, ThemeKey, MusicSelection as TypeMusicSelection } from '../../src/types';
import type { EngineInput, MusicSelection as EngineMusicSelection } from '../../src/features/storybook/engine/types';
import { generateStorybook } from '../../src/features/storybook/storybookEngine';
import { StorybookPager } from '../../src/components/storybook/StorybookPager';
import { StoryReadyReveal } from '../../src/components/storybook/StoryReadyReveal';
import { StorybookGenerationProgress } from '../../src/components/storybook/StorybookGenerationProgress';
import { SkeletonLoader } from '../../src/components/core/SkeletonLoader';
import { ErrorState } from '../../src/components/core/ErrorState';
import { musicService } from '../../src/features/music/musicService';
import { useEventStore } from '../../src/stores/eventStore';
import { colors } from '../../src/styles/theme';
import { getEventTypeDef } from '../../src/features/events/eventTypes';
import { supabase } from '../../src/lib/supabase';

type StorybookRow = {
  id: string;
  event_id: string;
  title: string;
  status: 'generating' | 'complete' | 'failed' | string;
  theme_key: string | null;
  quality_score: Record<string, unknown> | null;
  storybook_json: unknown;
};

type MediaRow = {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  media_type: string;
  captured_at: string | null;
  uploaded_at: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  quality_score: number | null;
  feature_score: number | null;
  uploader_id: string | null;
  uploader?: { display_name: string | null } | { display_name: string | null }[] | null;
  media_reactions?: { id: string }[] | null;
};

type LocationRow = {
  latitude: number;
  longitude: number;
  captured_at: string;
  place_label: string | null;
  accuracy_m: number | null;
  speed_mps: number | null;
  altitude_m: number | null;
};

type CaptionRow = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  text: string;
  media_id: string | null;
  created_at: string | null;
  profiles?: { display_name: string | null } | { display_name: string | null }[] | null;
};

function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeStorybook(value: unknown): Storybook | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { storybook?: Storybook };
  return record.storybook ?? (value as Storybook);
}

function toEngineEventType(value: string): EventType {
  return getEventTypeDef(value as EventType).key as EventType;
}

async function signedMediaUrl(storagePath: string): Promise<string> {
  if (/^https?:\/\//.test(storagePath) || storagePath.startsWith('file://')) return storagePath;

  const { data, error } = await supabase.storage
    .from('event-media')
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) return storagePath;
  return data.signedUrl;
}

async function fetchCaptions(eventId: string): Promise<EngineInput['captions']> {
  const { data, error } = await supabase
    .from('captions')
    .select('id,user_id,display_name,text,media_id,created_at,profiles(display_name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) return [];

  return ((data ?? []) as unknown as CaptionRow[]).map((row) => {
    const profile = firstRelated(row.profiles);
    return {
      id: row.id,
      userId: row.user_id ?? undefined,
      name: row.display_name ?? profile?.display_name ?? 'Guest',
      text: row.text,
      mediaId: row.media_id ?? undefined,
      createdAt: row.created_at ?? new Date().toISOString(),
    };
  });
}

async function fetchRealEngineInput(eventId: string): Promise<EngineInput> {
  const event = await useEventStore.getState().loadEventById(eventId);
  if (!event) throw new Error('Event not found');

  const [mediaResult, locationResult, captions] = await Promise.all([
    supabase
      .from('media_assets')
      .select('id,storage_path,thumbnail_path,media_type,captured_at,uploaded_at,width,height,duration_seconds,quality_score,feature_score,uploader_id,uploader:profiles!uploader_id(display_name),media_reactions(id)')
      .eq('event_id', event.id)
      .eq('is_deleted', false)
      .eq('upload_status', 'uploaded')
      .order('captured_at', { ascending: true }),
    supabase
      .from('location_points')
      .select('latitude,longitude,captured_at,place_label,accuracy_m,speed_mps,altitude_m')
      .eq('event_id', event.id)
      .order('captured_at', { ascending: true }),
    fetchCaptions(event.id),
  ]);

  if (mediaResult.error) throw mediaResult.error;
  if (locationResult.error) throw locationResult.error;

  const mediaRows = (mediaResult.data ?? []) as unknown as MediaRow[];
  const media = await Promise.all(mediaRows.map(async (row) => {
    const uploader = firstRelated(row.uploader);
    return {
      id: row.id,
      uri: await signedMediaUrl(row.storage_path),
      storagePath: row.storage_path,
      thumbnailUri: row.thumbnail_path ? await signedMediaUrl(row.thumbnail_path) : undefined,
      thumbnailPath: row.thumbnail_path ?? undefined,
      capturedAt: row.captured_at ?? row.uploaded_at ?? event.startsAt,
      uploaderName: uploader?.display_name ?? 'Guest',
      uploaderId: row.uploader_id ?? undefined,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      durationSeconds: row.duration_seconds ?? undefined,
      mediaType: row.media_type === 'video' ? 'video' as const : 'photo' as const,
      reactions: row.media_reactions?.length ?? 0,
      sharpnessScore: row.quality_score ?? undefined,
    };
  }));

  const locations = ((locationResult.data ?? []) as unknown as LocationRow[]).map((row) => ({
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    capturedAt: row.captured_at,
    placeLabel: row.place_label ?? undefined,
    accuracyM: row.accuracy_m ?? undefined,
    speedMps: row.speed_mps ?? undefined,
    altitudeM: row.altitude_m ?? undefined,
  }));

  const eventTypeDef = getEventTypeDef(event.type);
  const theme = (event.theme ?? 'cinematic') as ThemeKey;

  return {
    event: {
      id: event.id,
      title: event.title,
      type: toEngineEventType(eventTypeDef.key),
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      locationLabel: event.locationLabel,
    },
    media,
    locations,
    captions,
    theme,
    privacySettings: {
      blurPrivateLocations: true,
      shareSafeMode: false,
    },
  };
}

export default function EventStorybookScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>('cinematic');
  const [databaseStorybookId, setDatabaseStorybookId] = useState<string | undefined>();
  const [showReveal, setShowReveal] = useState(true);
  const revealDismissedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [musicSelection, setMusicSelection] = useState<EngineMusicSelection | null>(null);
  const [musicMuted, setMusicMuted] = useState(false);
  const isMountedRef = useRef(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const gradientShift = useSharedValue(0);

  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const loadSavedStorybook = useCallback(async (eventId: string): Promise<boolean> => {
    const { data, error: fetchError } = await supabase
      .from('storybooks')
      .select('id,event_id,title,status,theme_key,quality_score,storybook_json')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;
    const row = data as StorybookRow | null;
    if (!row) return false;
    if (row.status === 'failed') throw new Error('Storybook generation failed');
    if (row.status !== 'complete') return false;

    const savedStorybook = normalizeStorybook(row.storybook_json);
    if (!savedStorybook) return false;

    if (!isMountedRef.current) return true;
    setStorybook(savedStorybook);
    setDatabaseStorybookId(row.id);
    if (!revealDismissedRef.current) setShowReveal(true);
    setThemeKey((row.theme_key ?? 'cinematic') as ThemeKey);
    setMusicSelection((savedStorybook as Storybook & { musicSelection?: EngineMusicSelection }).musicSelection ?? null);
    setIsLoading(false);
    return true;
  }, []);

  const subscribeToProgress = useCallback((eventId: string) => {
    cleanupSubscription();
    channelRef.current = supabase
      .channel(`storybook-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'storybooks', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as StorybookRow;
          if (row.status === 'failed' && isMountedRef.current) {
            setError('Storybook generation failed');
            setIsLoading(false);
          }
          if (row.status === 'complete') {
            loadSavedStorybook(eventId).catch((err) => {
              if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : 'Failed to load storybook');
                setIsLoading(false);
              }
            });
          }
        },
      )
      .subscribe();
  }, [cleanupSubscription, loadSavedStorybook]);

  const generateFromEvent = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    subscribeToProgress(id);

    try {
      const foundSaved = await loadSavedStorybook(id);
      if (foundSaved) return;

      const input = await fetchRealEngineInput(id);
      const result = await generateStorybook(input);

      if (!isMountedRef.current) return;
      setStorybook(result.storybook);
      setDatabaseStorybookId(undefined);
      if (!revealDismissedRef.current) setShowReveal(true);
      setThemeKey(input.theme);
      setMusicSelection(result.storybook.musicSelection ?? null);
      setIsLoading(false);
    } catch (err) {
      console.warn('[EventStorybook] Generation failed:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Could not build this storybook');
        setIsLoading(false);
      }
    }
  }, [id, loadSavedStorybook, subscribeToProgress]);

  useEffect(() => {
    revealDismissedRef.current = false;
    setShowReveal(true);
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;
    gradientShift.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    generateFromEvent();
    return () => {
      isMountedRef.current = false;
      cleanupSubscription();
    };
  }, [cleanupSubscription, generateFromEvent]);

  const gradientGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + gradientShift.value * 0.25,
    transform: [
      { translateY: -24 + gradientShift.value * 48 },
      { scale: 1 + gradientShift.value * 0.04 },
    ],
  }));

  useEffect(() => {
    if (!musicSelection || !musicService.hasPlaybackForSelection(musicSelection as unknown as TypeMusicSelection)) return;
    (async () => {
      try {
        await musicService.preload(musicSelection as unknown as TypeMusicSelection);
      } catch (preloadError) {
        console.warn('[EventStorybook] Music preload error:', preloadError);
      }
    })();
    return () => {
      musicService.cleanup().catch(() => {});
    };
  }, [musicSelection]);

  useFocusEffect(
    React.useCallback(() => {
      if (musicSelection && musicService.hasPlaybackForSelection(musicSelection as unknown as TypeMusicSelection)) {
        musicService.play().catch(() => {});
      }

      return () => {
        musicService.stop().catch(() => {});
      };
    }, [musicSelection]),
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#F7F4FF', '#EFE7FF', '#FCEBFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.loadingGlow, gradientGlowStyle]}>
          <LinearGradient
            colors={['rgba(91,44,255,0.32)', 'rgba(236,63,164,0.18)', 'rgba(24,199,213,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <ActivityIndicator size="large" color={colors.purple} style={styles.spinner} />
        <Text style={styles.loadingText}>Creating your storybook...</Text>
        <StorybookGenerationProgress />
        <View style={styles.skeletonWrap}>
          <SkeletonLoader width="100%" height={300} borderRadius={20} style={styles.skeletonItem} />
          <SkeletonLoader width="80%" height={24} borderRadius={12} style={styles.skeletonItem} />
          <SkeletonLoader width="60%" height={16} borderRadius={8} style={styles.skeletonItem} />
          <SkeletonLoader width="100%" height={200} borderRadius={20} style={styles.skeletonItem} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <ErrorState
          title="Storybook not ready"
          message={`${error}. Try again in a moment.`}
          onRetry={generateFromEvent}
        />
      </View>
    );
  }

  if (!storybook) return null;

  if (showReveal) {
    return <StoryReadyReveal storybook={storybook} themeKey={themeKey} onOpen={() => { revealDismissedRef.current = true; setShowReveal(false); }} />;
  }

  return (
    <View style={styles.container}>
      <StorybookPager storybook={storybook} themeKey={themeKey} storybookId={databaseStorybookId} />
      <View style={[styles.storyToolbar, { top: insets.top + 8 }]}>
        {databaseStorybookId ? (
          <Pressable
            style={styles.storyToolButton}
            onPress={() => router.push(`/storybook/edit/${databaseStorybookId}`)}
            accessibilityLabel="Edit story"
          >
            <Ionicons name="create-outline" size={19} color="white" />
          </Pressable>
        ) : null}
        {musicSelection && musicService.hasPlaybackForSelection(musicSelection as unknown as TypeMusicSelection) ? (
          <Pressable
            style={styles.storyToolButton}
            onPress={async () => setMusicMuted(await musicService.toggleMute())}
            accessibilityLabel={musicMuted ? 'Unmute story music' : 'Mute story music'}
          >
            <Ionicons name={musicMuted ? 'volume-mute-outline' : 'volume-high-outline'} size={19} color="white" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0420',
  },
  loading: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: 80,
    right: -90,
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.soft,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 32,
  },
  skeletonWrap: {
    width: '100%',
    gap: 16,
  },
  skeletonItem: {
    marginBottom: 0,
  },
  storyToolbar: {
    position: 'absolute',
    right: 14,
    flexDirection: 'row',
    gap: 8,
    zIndex: 50,
  },
  storyToolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,4,32,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
