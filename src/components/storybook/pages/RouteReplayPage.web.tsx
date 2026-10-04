import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ResizeMode, Video } from 'expo-av';

import type { StorybookPage, StoryInsight } from '../../../types';
import type { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import {
  clusterRouteMediaMoments,
  type RouteMediaMoment,
  type RouteReplayScene,
} from '../../../features/location/routeReplayV2';

interface RouteReplayPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

type EnginePoint = { lat: number; lng: number; capturedAt?: string };
type Stop = { id?: string; lat: number; lng: number; placeLabel?: string };
type ProcessedRoute = { points?: EnginePoint[]; blurredPoints?: EnginePoint[]; stops?: Stop[]; hasRoute?: boolean };
type NormalPoint = { latitude: number; longitude: number; placeLabel?: string };
type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

function normalizeRoute(page: StorybookPage): NormalPoint[] {
  const raw = page.data.route;
  if (Array.isArray(raw)) {
    return raw
      .map((item) => item as Partial<NormalPoint>)
      .filter((item): item is NormalPoint => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  }
  const processed = raw as ProcessedRoute | undefined;
  if (!processed?.hasRoute) return [];
  return (processed.points ?? []).map((point) => ({ latitude: point.lat, longitude: point.lng }));
}

function routeStops(page: StorybookPage): NormalPoint[] {
  const processed = page.data.route as ProcessedRoute | undefined;
  if (!processed?.stops) return [];
  return processed.stops.map((stop) => ({ latitude: stop.lat, longitude: stop.lng, placeLabel: stop.placeLabel }));
}

function routeMediaFromPage(page: StorybookPage): RouteMediaMoment[] {
  const direct = page.data.routeMedia as RouteMediaMoment[] | undefined;
  return Array.isArray(direct) ? direct : [];
}

function routePath(points: NormalPoint[]): {
  path: string;
  plotted: Array<{ x: number; y: number }>;
  bounds?: Bounds;
} {
  if (!points.length) return { path: '', plotted: [] };
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const bounds: Bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
  const plotted = points.map((point) => plotLatLng(point.latitude, point.longitude, bounds));
  const path = plotted
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  return { path, plotted, bounds };
}

function plotLatLng(latitude: number, longitude: number, bounds: Bounds) {
  const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.00001);
  const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.00001);
  return {
    x: 8 + ((longitude - bounds.minLng) / lngRange) * 84,
    y: 92 - ((latitude - bounds.minLat) / latRange) * 84,
  };
}

function sceneLabel(scene: RouteReplayScene): string {
  if (scene === 'terrain') return 'Terrain replay';
  if (scene === 'city') return 'City replay';
  if (scene === 'venue') return 'Venue replay';
  if (scene === 'journey') return 'Journey replay';
  if (scene === 'town') return 'Town replay';
  return 'Route replay';
}

export function RouteReplayPage({ page, themePreset }: RouteReplayPageProps) {
  const points = useMemo(() => normalizeRoute(page), [page]);
  const stops = useMemo(() => routeStops(page), [page]);
  const plot = useMemo(() => routePath(points), [points]);
  const routeMedia = useMemo(() => routeMediaFromPage(page), [page]);
  const clusters = useMemo(() => clusterRouteMediaMoments(routeMedia, 75), [routeMedia]);
  const insights = ((page.data.insights as StoryInsight[] | undefined) ?? []).slice(0, 3);
  const scene = (page.data.routeReplayScene as RouteReplayScene | undefined) ?? 'standard';
  const tc = themePreset.colors;

  const [openClusterId, setOpenClusterId] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState(0);
  const openCluster = clusters.find((cluster) => cluster.id === openClusterId) ?? null;
  const openMoment = openCluster?.moments[openIndex] ?? null;

  if (!points.length) {
    return (
      <View style={[styles.container, { backgroundColor: tc.background }]}> 
        <Text style={[styles.kicker, { color: tc.accent }]}>ROUTE REPLAY</Text>
        <Text style={[styles.title, { color: tc.text }]}>No route for this story</Text>
        <Text style={[styles.subtitle, { color: tc.textMuted }]}>Route Replay was not turned on for this event.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}> 
      <View style={styles.heading}>
        <View style={styles.headingTopline}>
          <Text style={[styles.kicker, { color: tc.accent }]}>ROUTE REPLAY</Text>
          <Text style={[styles.scenePill, { color: tc.textMuted, borderColor: themePreset.card.borderColor }]}>{sceneLabel(scene)}</Text>
        </View>
        <Text style={[styles.title, { color: tc.text }]}>{page.title || 'The route'}</Text>
        {page.subtitle ? <Text style={[styles.subtitle, { color: tc.textMuted }]}>{page.subtitle}</Text> : null}
      </View>

      <View style={[styles.mapCard, { backgroundColor: tc.surface, borderColor: themePreset.card.borderColor }]}> 
        <View style={styles.gridOne} /><View style={styles.gridTwo} /><View style={styles.gridThree} />
        <Svg viewBox="0 0 100 100" width="100%" height="100%">
          <Path
            d={plot.path}
            fill="none"
            stroke={themePreset.mapPalette.route}
            strokeWidth={2.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {plot.plotted.filter((_, i) => i === 0 || i === plot.plotted.length - 1).map((point, index) => (
            <Circle
              key={`${point.x}-${point.y}-${index}`}
              cx={point.x}
              cy={point.y}
              r={index === 0 ? 3.4 : 2.8}
              fill={themePreset.mapPalette.route}
              stroke={tc.surface}
              strokeWidth={1.2}
            />
          ))}
        </Svg>

        {plot.bounds ? clusters.map((cluster) => {
          const position = plotLatLng(cluster.latitude, cluster.longitude, plot.bounds!);
          return (
            <Pressable
              key={cluster.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${cluster.moments.length} route ${cluster.moments.length === 1 ? 'moment' : 'moments'}`}
              onPress={() => { setOpenClusterId(cluster.id); setOpenIndex(0); }}
              style={[styles.mediaMarker, { left: `${position.x}%`, top: `${position.y}%`, borderColor: tc.surface }]}
            >
              <Image source={{ uri: cluster.primary.thumbnailUri ?? cluster.primary.uri }} style={styles.mediaMarkerImage} />
              {cluster.primary.mediaType === 'video' ? (
                <View style={styles.mediaMarkerVideo}><Text style={styles.mediaMarkerVideoText}>▶</Text></View>
              ) : null}
              {cluster.moments.length > 1 ? (
                <View style={[styles.mediaMarkerCount, { backgroundColor: themePreset.mapPalette.route }]}> 
                  <Text style={styles.mediaMarkerCountText}>{cluster.moments.length}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        }) : null}
      </View>

      {stops.filter((stop) => stop.placeLabel).length ? (
        <View style={styles.stopRow}>
          {stops.filter((stop) => stop.placeLabel).slice(0, 4).map((stop, i) => (
            <Text key={`${stop.placeLabel}-${i}`} style={[styles.stop, { color: tc.textMuted }]}>{i + 1}. {stop.placeLabel}</Text>
          ))}
        </View>
      ) : null}

      {clusters.length ? (
        <Text style={[styles.mediaHint, { color: tc.textMuted }]}>Tap a photo or video marker to open the group moment.</Text>
      ) : null}

      {insights.length ? (
        <View style={styles.stats}>
          {insights.map((insight) => (
            <View key={insight.key} style={[styles.stat, { backgroundColor: tc.surface, borderColor: themePreset.card.borderColor }]}> 
              <Text style={[styles.statValue, { color: tc.text }]}>{insight.value}</Text>
              <Text style={[styles.statLabel, { color: tc.textMuted }]}>{insight.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Modal visible={Boolean(openMoment)} transparent animationType="fade" onRequestClose={() => setOpenClusterId(null)}>
        <View style={styles.viewerBackdrop}>
          <Pressable style={styles.viewerClose} onPress={() => setOpenClusterId(null)}>
            <Text style={styles.viewerCloseText}>×</Text>
          </Pressable>
          {openMoment ? (
            <View style={styles.viewerCard}>
              {openMoment.mediaType === 'video' ? (
                <Video
                  source={{ uri: openMoment.uri }}
                  style={styles.viewerMedia}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  posterSource={openMoment.thumbnailUri ? { uri: openMoment.thumbnailUri } : undefined}
                  usePoster={Boolean(openMoment.thumbnailUri)}
                />
              ) : (
                <Image source={{ uri: openMoment.uri }} style={styles.viewerMedia} resizeMode="contain" />
              )}
              <Text style={styles.viewerByline}>{openMoment.uploaderName}</Text>
              {openMoment.placeLabel ? <Text style={styles.viewerPlace}>{openMoment.placeLabel}</Text> : null}
              {openCluster && openCluster.moments.length > 1 ? (
                <View style={styles.viewerNav}>
                  <Pressable onPress={() => setOpenIndex((openIndex - 1 + openCluster.moments.length) % openCluster.moments.length)}>
                    <Text style={styles.viewerNavText}>‹ Previous</Text>
                  </Pressable>
                  <Text style={styles.viewerIndex}>{openIndex + 1} / {openCluster.moments.length}</Text>
                  <Pressable onPress={() => setOpenIndex((openIndex + 1) % openCluster.moments.length)}>
                    <Text style={styles.viewerNavText}>Next ›</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 48, justifyContent: 'center' },
  heading: { width: '100%', maxWidth: 820, alignSelf: 'center', marginBottom: 18 },
  headingTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  scenePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 10, fontWeight: '800' },
  title: { fontSize: 38, lineHeight: 42, fontWeight: '900', marginTop: 7 },
  subtitle: { fontSize: 14, lineHeight: 21, fontWeight: '600', marginTop: 7 },
  mapCard: { width: '100%', maxWidth: 820, height: 420, alignSelf: 'center', overflow: 'hidden', borderRadius: 28, borderWidth: 1, padding: 18, position: 'relative' },
  gridOne: { position: 'absolute', top: '25%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(127,127,127,0.10)' },
  gridTwo: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(127,127,127,0.10)' },
  gridThree: { position: 'absolute', top: '75%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(127,127,127,0.10)' },
  mediaMarker: { position: 'absolute', width: 46, height: 46, marginLeft: -23, marginTop: -23, borderRadius: 15, borderWidth: 3, overflow: 'visible', backgroundColor: '#FFFFFF' },
  mediaMarkerImage: { width: '100%', height: '100%', borderRadius: 11 },
  mediaMarkerVideo: { position: 'absolute', left: 13, top: 13, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(15,6,44,0.78)', alignItems: 'center', justifyContent: 'center' },
  mediaMarkerVideoText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  mediaMarkerCount: { position: 'absolute', right: -8, top: -8, minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 5, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  mediaMarkerCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  stopRow: { width: '100%', maxWidth: 820, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  stop: { fontSize: 11, fontWeight: '700' },
  mediaHint: { width: '100%', maxWidth: 820, alignSelf: 'center', fontSize: 11, fontWeight: '700', marginTop: 10 },
  stats: { width: '100%', maxWidth: 820, alignSelf: 'center', flexDirection: 'row', gap: 10, marginTop: 16 },
  stat: { flex: 1, minWidth: 110, borderRadius: 18, borderWidth: 1, padding: 14 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 3 },
  viewerBackdrop: { flex: 1, backgroundColor: 'rgba(10,6,22,0.94)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  viewerClose: { position: 'absolute', right: 26, top: 22, zIndex: 5, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  viewerCloseText: { color: '#FFFFFF', fontSize: 30, lineHeight: 32 },
  viewerCard: { width: '100%', maxWidth: 900, height: '82%', alignItems: 'center', justifyContent: 'center' },
  viewerMedia: { width: '100%', height: '82%' },
  viewerByline: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 10 },
  viewerPlace: { color: 'rgba(255,255,255,0.64)', fontSize: 11, fontWeight: '700', marginTop: 3 },
  viewerNav: { flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 12 },
  viewerNavText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  viewerIndex: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },
});
