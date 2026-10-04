import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage, StoryInsight } from '../../../types';
import { MediaViewer } from '../../media/MediaViewer';
import { clusterRouteMediaMoments, type RouteMediaMoment } from '../../../features/location/routeReplayV2';
import type { MediaAsset } from '../../../features/media/mediaService';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface RouteReplayPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  capturedAt: string;
  placeLabel?: string;
  accuracyM?: number;
}


interface EngineRoutePoint {
  lat: number;
  lng: number;
  capturedAt: string;
}

interface EngineRouteStop {
  id: string;
  lat: number;
  lng: number;
  placeLabel?: string;
  bestPhoto?: { uri?: string };
}

interface ProcessedRouteData {
  points?: EngineRoutePoint[];
  blurredPoints?: EngineRoutePoint[];
  stops?: EngineRouteStop[];
  hasRoute?: boolean;
}

interface OverlayCardProps {
  insight: StoryInsight;
  preset: ThemePreset;
  delayMs: number;
  reduceMotion: boolean;
}

function OverlayCard({ insight, preset, delayMs, reduceMotion }: OverlayCardProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 30);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor:
            preset.insightStyle === 'map_stats' ? `${preset.colors.background}E6` : preset.colors.surface,
          borderRadius: preset.card.borderRadius,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: preset.card.borderWidth,
          borderColor: preset.insightStyle === 'map_stats' ? preset.mapPalette.route : preset.card.borderColor,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: preset.insightStyle === 'map_stats' ? preset.mapPalette.route : preset.colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 0 }}>
        {insight.value}
      </Text>
      <Text style={{ color: preset.colors.textMuted, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
        {insight.label}
      </Text>
    </Animated.View>
  );
}

// ─── Animated Pin ─────────────────────────────────────────────

interface AnimatedPinProps {
  point: RoutePoint;
  index: number;
  totalPoints: number;
  accentColor: string;
  surfaceColor: string;
  reduceMotion: boolean;
  routeDrawDurationMs: number;
}

function AnimatedPin({
  point,
  index,
  totalPoints,
  accentColor,
  surfaceColor,
  reduceMotion,
  routeDrawDurationMs,
}: AnimatedPinProps) {
  // Stagger pin drops along the route draw timeline
  const pinDelay = reduceMotion ? 0 : (index / Math.max(totalPoints, 1)) * routeDrawDurationMs;

  const scale = useSharedValue(reduceMotion ? 1 : 0);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withDelay(
      pinDelay,
      withSpring(1, { damping: 12, stiffness: 200, mass: 0.8 }),
    );
    opacity.value = withDelay(pinDelay, withTiming(1, { duration: 200 }));
  }, [pinDelay, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Only show pins at meaningful stops (every Nth point to avoid clutter)
  const shouldShow = index === 0 || index === totalPoints - 1 || index % Math.ceil(totalPoints / 8) === 0;

  if (!shouldShow) return null;

  return (
    <Marker
      coordinate={{ latitude: point.latitude, longitude: point.longitude }}
      tracksViewChanges={false}
    >
      <Animated.View
        style={[
          {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: accentColor,
            borderWidth: 3,
            borderColor: surfaceColor,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        <Text style={{ fontSize: 13, fontWeight: '900', color: surfaceColor }}>
          {index + 1}
        </Text>
      </Animated.View>
    </Marker>
  );
}

interface NoRouteFallbackProps {
  insights: StoryInsight[];
  preset: ThemePreset;
  reduceMotion: boolean;
}

function NoRouteFallback({ insights, preset, reduceMotion }: NoRouteFallbackProps) {
  const fadeOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    fadeOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [reduceMotion]);

  const fallbackStyle = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));
  const tc = preset.colors;

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <Animated.View style={[styles.fallback, fallbackStyle]}>
        <Text style={[styles.fallbackTitle, { color: tc.text }]}>
          No route for this story
        </Text>
        <Text style={[styles.fallbackSubtitle, { color: tc.textMuted }]}>
          Route Replay was not turned on for this event.
        </Text>
        {insights.length > 0 && (
          <View style={styles.fallbackStats}>
            {insights.map((insight, i) => (
              <OverlayCard
                key={insight.key}
                insight={insight}
                preset={preset}
                delayMs={i * 100}
                reduceMotion={reduceMotion}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function normalizeRouteData(page: StorybookPage): RoutePoint[] {
  const rawRoute = page.data.route;
  if (Array.isArray(rawRoute)) return rawRoute as RoutePoint[];

  const processed = rawRoute as ProcessedRouteData | undefined;
  if (!processed?.hasRoute) return [];
  return (processed.points ?? []).map((point) => ({
    latitude: point.lat,
    longitude: point.lng,
    capturedAt: point.capturedAt,
  }));
}

function routeMediaFromPage(page: StorybookPage): RouteMediaMoment[] {
  const direct = page.data.routeMedia as RouteMediaMoment[] | undefined;
  if (Array.isArray(direct)) return direct;

  // Backwards-compatible fallback for older stories that only carried one photo per stop.
  const routePhotos = page.data.routePhotos as Array<{ stopId?: string; photo?: Record<string, unknown> }> | undefined;
  const processed = page.data.route as ProcessedRouteData | undefined;
  if (!Array.isArray(routePhotos) || !processed?.stops) return [];

  return routePhotos.flatMap((entry, index) => {
    const stop = processed.stops?.find((candidate) => candidate.id === entry.stopId);
    const photo = entry.photo ?? {};
    if (!stop || typeof photo.uri !== 'string') return [];
    return [{
      id: typeof photo.id === 'string' ? photo.id : `legacy-route-media-${index}`,
      uri: photo.uri,
      thumbnailUri: typeof photo.thumbnailUri === 'string' ? photo.thumbnailUri : photo.uri,
      mediaType: photo.mediaType === 'video' ? 'video' : 'photo',
      latitude: stop.lat,
      longitude: stop.lng,
      capturedAt: typeof photo.capturedAt === 'string' ? photo.capturedAt : '',
      uploaderId: typeof photo.uploaderId === 'string' ? photo.uploaderId : undefined,
      uploaderName: typeof photo.uploaderName === 'string' ? photo.uploaderName : 'Guest',
      reactions: typeof photo.reactions === 'number' ? photo.reactions : 0,
      durationSeconds: typeof photo.durationSeconds === 'number' ? photo.durationSeconds : undefined,
    }];
  });
}

function momentToMediaAsset(moment: RouteMediaMoment): MediaAsset {
  return {
    id: moment.id,
    eventId: 'storybook-route',
    uri: moment.uri,
    thumbnailUri: moment.thumbnailUri ?? moment.uri,
    mediaType: moment.mediaType,
    width: moment.width ?? 0,
    height: moment.height ?? 0,
    durationSeconds: moment.durationSeconds,
    uploaderId: moment.uploaderId ?? 'guest',
    uploaderName: moment.uploaderName || 'Guest',
    capturedAt: moment.capturedAt || new Date(0).toISOString(),
    uploadedAt: moment.capturedAt || new Date(0).toISOString(),
    reactions: moment.reactions ?? 0,
    storagePath: moment.storagePath,
    thumbnailPath: moment.thumbnailPath,
    gpsLat: moment.latitude,
    gpsLng: moment.longitude,
  };
}

export function RouteReplayPage({ page, themePreset }: RouteReplayPageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const route = useMemo(() => normalizeRouteData(page), [page]);
  const routeMedia = useMemo(() => routeMediaFromPage(page), [page]);
  const routeMediaClusters = useMemo(() => clusterRouteMediaMoments(routeMedia, 75), [routeMedia]);
  const [viewerMedia, setViewerMedia] = useState<MediaAsset[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const insights = (page.data.insights as StoryInsight[]) ?? [];
  const [visiblePointCount, setVisiblePointCount] = useState(reduceMotion ? route.length : 2);

  // Route draw animation progress (0 → 1)
  const routeProgress = useSharedValue(reduceMotion ? 1 : 0);
  const mapOpacity = useSharedValue(reduceMotion ? 1 : 0);

  // Route animation duration based on theme motion
  const routeDrawDurationMs = useMemo(() => {
    if (themePreset.insightStyle === 'map_stats') return themePreset.motionTiming.heroMs / 2;
    return Math.max(1200, themePreset.motionTiming.pageTransitionMs * 2);
  }, [themePreset.insightStyle, themePreset.motionTiming.heroMs, themePreset.motionTiming.pageTransitionMs]);

  useEffect(() => {
    if (reduceMotion) {
      routeProgress.value = 1;
      mapOpacity.value = 1;
      setVisiblePointCount(route.length);
      return;
    }

    // Map fade in first
    mapOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });

    // Then draw the route progressively
    routeProgress.value = withDelay(
      200,
      withTiming(1, { duration: routeDrawDurationMs, easing: Easing.inOut(Easing.cubic) }),
    );
  }, [reduceMotion, routeDrawDurationMs]);

  useAnimatedReaction(
    () => routeProgress.value,
    (progress) => {
      const nextCount = Math.max(2, Math.ceil(progress * route.length));
      runOnJS(setVisiblePointCount)(nextCount);
    },
    [route.length],
  );

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mapOpacity.value,
  }));

  // Compute map region
  const region: Region | null = useMemo(() => {
    if (route.length === 0) return null;
    const lats = route.map(r => r.latitude);
    const lngs = route.map(r => r.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = (maxLat - minLat) * 0.15 || 0.01;
    const padLng = (maxLng - minLng) * 0.15 || 0.01;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + padLat * 2 || 0.05,
      longitudeDelta: (maxLng - minLng) + padLng * 2 || 0.05,
    };
  }, [route]);

  const tc = themePreset.colors;

  // Progressive route: show only points up to current progress
  // We use a derived approach — since Polyline doesn't support animated props easily,
  // we compute the visible portion based on a state-driven progress value.
  // For the animation, we use opacity on overlaid polylines.
  const polylineCoords = route.map(r => ({
    latitude: r.latitude,
    longitude: r.longitude,
  }));
  const visiblePolylineCoords = polylineCoords.slice(0, Math.min(visiblePointCount, polylineCoords.length));

  const openMediaCluster = (clusterId: string) => {
    const cluster = routeMediaClusters.find((item) => item.id === clusterId);
    if (!cluster) return;
    setViewerMedia(cluster.moments.map(momentToMediaAsset));
    setViewerVisible(true);
  };

  // No route fallback
  if (route.length === 0) {
    return <NoRouteFallback insights={insights} preset={themePreset} reduceMotion={reduceMotion} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <Animated.View style={[styles.mapWrap, mapAnimatedStyle]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region ?? undefined}
          customMapStyle={getThemeMapStyle(themePreset)}
          showsTraffic={false}
          showsBuildings={false}
          showsCompass={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Full route polyline (faded, as background) */}
          {polylineCoords.length >= 2 && (
            <Polyline
              coordinates={polylineCoords}
              strokeColor={`${themePreset.mapPalette.routeShadow}66`}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Animated progressive route line */}
          {visiblePolylineCoords.length >= 2 && (
            <Polyline
              coordinates={visiblePolylineCoords}
              strokeColor={themePreset.mapPalette.route}
              strokeWidth={themePreset.insightStyle === 'map_stats' ? 6 : 4}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Photo pins drop in sequence */}
          {route.map((point, index) => (
            <AnimatedPin
              key={index}
              point={point}
              index={index}
              totalPoints={route.length}
              accentColor={themePreset.mapPalette.pin}
              surfaceColor={tc.surface}
              reduceMotion={reduceMotion}
              routeDrawDurationMs={routeDrawDurationMs}
            />
          ))}

          {routeMediaClusters.map((cluster) => (
            <Marker
              key={cluster.id}
              coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
              onPress={() => openMediaCluster(cluster.id)}
            >
              <View style={[styles.storyMediaPin, { borderColor: tc.surface }]}>
                <Image source={{ uri: cluster.primary.thumbnailUri ?? cluster.primary.uri }} style={styles.storyMediaThumb} />
                {cluster.primary.mediaType === 'video' ? (
                  <View style={styles.storyMediaPlay}><Text style={styles.storyMediaPlayText}>▶</Text></View>
                ) : null}
                {cluster.moments.length > 1 ? (
                  <View style={[styles.storyMediaCount, { backgroundColor: themePreset.mapPalette.route }]}>
                    <Text style={styles.storyMediaCountText}>{cluster.moments.length}</Text>
                  </View>
                ) : null}
              </View>
            </Marker>
          ))}
        </MapView>
      </Animated.View>

      {/* Overlay cards */}
      <View style={[styles.overlayCards, { bottom: insets.bottom + 20 }]}>
        {insights.map((insight, i) => (
          <OverlayCard
            key={insight.key}
            insight={insight}
            preset={themePreset}
            delayMs={routeDrawDurationMs + 300 + i * 100}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>

      <MediaViewer
        visible={viewerVisible}
        media={viewerMedia}
        startIndex={0}
        onClose={() => setViewerVisible(false)}
      />

      {/* Title overlay */}
      <View style={[styles.titleOverlay, { top: insets.top + 16 }]}>
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
    </View>
  );
}

// ─── Map Styles ───────────────────────────────────────────────

function getThemeMapStyle(preset: ThemePreset) {
  const palette = preset.mapPalette;
  return [
    { elementType: 'geometry', stylers: [{ color: palette.land }] },
    { elementType: 'labels.text.fill', stylers: [{ color: palette.label }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: preset.colors.background }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: palette.road }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: palette.label }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.water }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: palette.land }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: preset.colors.surface }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: palette.label }] },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    flex: 1,
  },
  storyMediaPin: {
    width: 46,
    height: 46,
    borderRadius: 15,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  storyMediaThumb: { width: '100%', height: '100%', borderRadius: 11 },
  storyMediaPlay: {
    position: 'absolute', left: 13, top: 13, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(15,6,44,0.78)', alignItems: 'center', justifyContent: 'center',
  },
  storyMediaPlayText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  storyMediaCount: {
    position: 'absolute', right: -7, top: -7, minWidth: 21, height: 21, paddingHorizontal: 5,
    borderRadius: 11, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  storyMediaCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  titleOverlay: {
    position: 'absolute',
    left: 22,
    right: 22,
  },
  title: {
    letterSpacing: 0,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.88,
  },
  overlayCards: {
    position: 'absolute',
    left: 22,
    right: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  fallbackTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  fallbackStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
});
