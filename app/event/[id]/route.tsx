// ─── Route Capture Control Screen ─────────────────────────────
// Shows capture status, map preview, controls, and stats.
// Privacy-first: "Route Replay is event-only" reminder always visible.

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  ViewStyle,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import MapView, { Polyline, Marker, Region } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useLocationStore } from '../../../src/stores/locationStore';
import { useEventStore } from '../../../src/stores/eventStore';
import { useMediaStore } from '../../../src/stores/mediaStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { useReducedMotion } from '../../../src/hooks/useReducedMotion';
import { ConsentModal } from '../../../src/components/location/ConsentModal';
import { RouteSummaryCard } from '../../../src/components/location/RouteSummaryCard';
import { MediaViewer } from '../../../src/components/media/MediaViewer';
import { LocationPoint, CaptureStatus } from '../../../src/features/location/locationTypes';
import {
  calculateRouteDistance,
  calculateRouteDuration,
} from '../../../src/features/location/locationService';
import { colors } from '../../../src/styles/theme';
import { buildRouteMediaMoments, clusterRouteMediaMoments } from '../../../src/features/location/routeReplayV2';
import type { MediaAsset } from '../../../src/features/media/mediaService';

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string; icon: string }> = {
    idle: { color: '#746B8C', label: 'Ready', icon: 'location-outline' },
    requesting_consent: { color: '#FFB020', label: 'Permission needed', icon: 'lock-closed-outline' },
    capturing: { color: '#19C37D', label: 'Adding route', icon: 'radio-button-on' },
    paused: { color: '#FFB020', label: 'Paused', icon: 'pause-circle' },
    stopped: { color: '#746B8C', label: 'Stopped', icon: 'stop-circle-outline' },
  };

  const c = config[status] ?? config.idle;

  return (
    <View style={[styles.statusBadge, { backgroundColor: c.color + '22' }]}>
      <Ionicons name={c.icon as any} size={14} color={c.color} />
      <Text style={[styles.statusText, { color: c.color }]}>{c.label}</Text>
      {status === 'capturing' && (
        <View style={[styles.pulseDot, { backgroundColor: c.color }]} />
      )}
    </View>
  );
}

// ─── Control Button ───────────────────────────────────────────

interface ControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

function ControlButton({ icon, label, onPress, variant, disabled, style }: ControlButtonProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
    if (!reduceMotion) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: '#5B2CFF', text: '#FFFFFF', border: 'transparent' },
    secondary: { bg: '#F7F4FF', text: '#5B2CFF', border: '#E8E1F8' },
    danger: { bg: '#FF6B6B15', text: '#FF6B6B', border: '#FF6B6B44' },
  };

  const v = variantStyles[variant]!;

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          styles.controlButton,
          { backgroundColor: v.bg, opacity: disabled ? 0.4 : 1 },
          variant === 'secondary' && { borderWidth: 1, borderColor: v.border },
          variant === 'danger' && { borderWidth: 1, borderColor: v.border },
          animatedStyle,
          style,
        ]}
      >
        <Ionicons name={icon} size={20} color={v.text} />
        <Text style={[styles.controlButtonText, { color: v.text }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function RouteCaptureScreen() {
  const reduceMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    routeByEvent,
    isCapturing,
    captureStatus,
    consentGiven,
    activeCaptureEventId,
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    giveConsent,
    revokeConsent,
    loadStoredRoutes,
  } = useLocationStore();

  const { activeEvent, loadEventById } = useEventStore();
  const { mediaByEvent, loadEventMedia, initStore } = useMediaStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [showConsent, setShowConsent] = useState(false);
  const [routeViewerVisible, setRouteViewerVisible] = useState(false);
  const [routeViewerMedia, setRouteViewerMedia] = useState<MediaAsset[]>([]);

  // Load event + stored routes on mount
  useEffect(() => {
    if (id) {
      loadEventById(id);
      loadStoredRoutes(id);
      initStore().then(() => loadEventMedia(id));
    }
  }, [id]);

  const route = routeByEvent[id ?? ''] ?? [];
  const eventMedia = mediaByEvent[id ?? ''] ?? [];
  const routeMediaClusters = useMemo(
    () => clusterRouteMediaMoments(buildRouteMediaMoments(eventMedia), 75),
    [eventMedia],
  );
  const hasConsent = consentGiven[id ?? ''] ?? false;
  const isThisEventCapturing = isCapturing && activeCaptureEventId === id;
  const isThisEventPaused = captureStatus === 'paused' && activeCaptureEventId === id;

  // Stats
  const stats = useMemo(() => {
    if (route.length === 0) return { distanceKm: 0, durationHours: 0, pointsCount: 0 };
    return {
      distanceKm: calculateRouteDistance(route),
      durationHours: calculateRouteDuration(route),
      pointsCount: route.length,
    };
  }, [route]);

  // Map region
  const region = useMemo<Region | null>(() => {
    const coordinateSources = [
      ...route.map(r => ({ latitude: r.latitude, longitude: r.longitude })),
      ...routeMediaClusters.map(cluster => ({ latitude: cluster.latitude, longitude: cluster.longitude })),
    ];
    if (coordinateSources.length === 0) {
      return {
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    const lats = coordinateSources.map(r => r.latitude);
    const lngs = coordinateSources.map(r => r.longitude);
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
  }, [route, routeMediaClusters]);

  // Handlers
  const handleStartPress = useCallback(() => {
    if (!hasConsent) {
      setShowConsent(true);
      return;
    }
    startCapture(id!);
  }, [hasConsent, id, startCapture]);

  const handleConsentAllow = useCallback(() => {
    if (!id) return;
    giveConsent(id);
    setShowConsent(false);
    startCapture(id);
  }, [id, giveConsent, startCapture]);

  const handlePause = useCallback(() => {
    pauseCapture();
  }, [pauseCapture]);

  const handleResume = useCallback(() => {
    resumeCapture();
  }, [resumeCapture]);

  const handleStop = useCallback(() => {
    Alert.alert(
      'Stop Route Replay?',
      'This ends the map for this event.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            if (id) stopCapture(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          },
        },
      ],
    );
  }, [id, stopCapture]);

  const handleConsentToggle = useCallback(() => {
    if (!id) return;
    if (hasConsent) {
      Alert.alert(
        'Turn off location access?',
        'This will stop Route Replay for this event.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Revoke',
            style: 'destructive',
            onPress: () => revokeConsent(id),
          },
        ],
      );
    } else {
      setShowConsent(true);
    }
  }, [id, hasConsent, revokeConsent]);

  const openRouteMediaCluster = useCallback((clusterId: string) => {
    const cluster = routeMediaClusters.find((item) => item.id === clusterId);
    if (!cluster) return;
    const ids = new Set(cluster.moments.map((moment) => moment.id));
    const media = eventMedia.filter((item) => ids.has(item.id));
    if (!media.length) return;
    setRouteViewerMedia(media);
    setRouteViewerVisible(true);
  }, [routeMediaClusters, eventMedia]);

  const polylineCoords = route.map(r => ({
    latitude: r.latitude,
    longitude: r.longitude,
  }));

  const currentStatus = isThisEventCapturing ? 'capturing' : isThisEventPaused ? 'paused' : hasConsent ? 'idle' : 'idle';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#18122B" />
        </Pressable>
        <Text style={styles.headerTitle}>Route Replay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Reminder */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(100)}
          style={styles.privacyReminder}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color="#5B2CFF" />
          <Text style={styles.privacyReminderText}>
            Route Replay only runs for this event. It stops when the event ends.
          </Text>
        </Animated.View>

        {/* Status Badge */}
        <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(150)}>
          <StatusBadge status={currentStatus} />
        </Animated.View>

        {/* Map Preview */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(200)}
          style={styles.mapContainer}
        >
          <MapView
            style={styles.mapPreview}
            region={region ?? undefined}
            showsTraffic={false}
            showsBuildings={false}
            showsCompass={false}
            rotateEnabled={false}
            pitchEnabled={false}
            customMapStyle={mapPreviewStyle}
          >
            {polylineCoords.length >= 2 && (
              <Polyline
                coordinates={polylineCoords}
                strokeColor="#5B2CFF"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {route.length > 0 && (
              <Marker
                coordinate={{
                  latitude: route[0]!.latitude,
                  longitude: route[0]!.longitude,
                }}
                tracksViewChanges={false}
              >
                <View style={styles.startPin}>
                  <Ionicons name="flag" size={14} color="#FFFFFF" />
                </View>
              </Marker>
            )}
            {route.length > 1 && (
              <Marker
                coordinate={{
                  latitude: route[route.length - 1]!.latitude,
                  longitude: route[route.length - 1]!.longitude,
                }}
                tracksViewChanges={false}
              >
                <View style={styles.endPin}>
                  <Ionicons name="location" size={14} color="#FFFFFF" />
                </View>
              </Marker>
            )}
            {routeMediaClusters.map((cluster) => (
              <Marker
                key={cluster.id}
                coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                onPress={() => openRouteMediaCluster(cluster.id)}
              >
                <View style={styles.mediaMomentPin}>
                  <Image
                    source={{ uri: cluster.primary.thumbnailUri ?? cluster.primary.uri }}
                    style={styles.mediaMomentThumb}
                  />
                  {cluster.primary.mediaType === 'video' ? (
                    <View style={styles.mediaMomentVideo}>
                      <Ionicons name="play" size={10} color="#FFFFFF" />
                    </View>
                  ) : null}
                  {cluster.moments.length > 1 ? (
                    <View style={styles.mediaMomentCount}>
                      <Text style={styles.mediaMomentCountText}>{cluster.moments.length}</Text>
                    </View>
                  ) : null}
                </View>
              </Marker>
            ))}
          </MapView>
        </Animated.View>

        {route.length === 0 && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(260)}
            style={styles.emptyRouteState}
          >
            <View style={styles.emptyRouteIcon}>
              <Ionicons name="map-outline" size={30} color="#5B2CFF" />
            </View>
            <View style={styles.emptyRouteTextWrap}>
              <Text style={styles.emptyRouteTitle}>No route captured for this event</Text>
              <Text style={styles.emptyRouteSubtitle}>
                Start Route Replay when the event begins to save the journey.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Stats */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(300)}
          style={styles.statsRow}
        >
          <StatBox label="Distance" value={`${stats.distanceKm}`} unit="km" />
          <StatBox label="Duration" value={`${stats.durationHours}`} unit="h" />
          <StatBox label="Route marks" value={`${stats.pointsCount}`} unit="" />
        </Animated.View>

        {/* Controls */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(400)}
          style={styles.controlsSection}
        >
          {currentStatus === 'capturing' ? (
            <View style={styles.controlRow}>
              <ControlButton
                icon="pause"
                label="Pause"
                onPress={handlePause}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <ControlButton
                icon="stop-circle"
                label="Stop"
                onPress={handleStop}
                variant="danger"
                style={{ flex: 1 }}
              />
            </View>
          ) : currentStatus === 'paused' ? (
            <View style={styles.controlRow}>
              <ControlButton
                icon="play"
                label="Resume"
                onPress={handleResume}
                variant="primary"
                style={{ flex: 1 }}
              />
              <ControlButton
                icon="stop-circle"
                label="Stop"
                onPress={handleStop}
                variant="danger"
                style={{ flex: 1 }}
              />
            </View>
          ) : !isThisEventCapturing && !isThisEventPaused && (captureStatus as CaptureStatus) === 'stopped' && activeCaptureEventId === id ? (
            <View style={styles.stoppedMessage}>
              <Ionicons name="checkmark-circle" size={28} color="#19C37D" />
              <Text style={styles.stoppedTitle}>Route Replay complete</Text>
              <Text style={styles.stoppedSubtitle}>
                {route.length} route marks over {stats.distanceKm} km
              </Text>
            </View>
          ) : (
            <ControlButton
              icon="location"
              label="Start Route Replay"
              onPress={handleStartPress}
              variant="primary"
              style={{ width: '100%' }}
            />
          )}
        </Animated.View>

        {/* Consent Toggle */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(500)}
          style={styles.consentRow}
        >
          <View style={styles.consentInfo}>
            <Ionicons
              name={hasConsent ? 'checkmark-circle-outline' : 'radio-button-off'}
              size={20}
              color={hasConsent ? '#19C37D' : '#746B8C'}
            />
            <View>
              <Text style={styles.consentLabel}>Route Replay access</Text>
              <Text style={styles.consentStatus}>
                {hasConsent ? 'On for this event' : 'Off for now'}
              </Text>
            </View>
          </View>
          <Pressable onPress={handleConsentToggle} style={styles.consentToggle}>
            <Text style={styles.consentToggleText}>
              {hasConsent ? 'Revoke' : 'Allow'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Route Summary Card (when route exists) */}
        {route.length > 0 && (
          <RouteSummaryCard
            route={route}
            delayMs={600}
            style={{ marginTop: 16 }}
          />
        )}
      </ScrollView>

      <MediaViewer
        visible={routeViewerVisible}
        media={routeViewerMedia}
        startIndex={0}
        onClose={() => setRouteViewerVisible(false)}
        currentUserId={currentUserId ?? ''}
        canModerate={Boolean(currentUserId && activeEvent?.participants.some((participant) => participant.id === currentUserId && participant.isOrganiser))}
      />

      {/* Consent Modal */}
      <ConsentModal
        visible={showConsent}
        eventTitle={activeEvent?.title ?? 'this event'}
        onAllow={handleConsentAllow}
        onDismiss={() => setShowConsent(false)}
      />
    </SafeAreaView>
  );
}

// ─── Stat Box ─────────────────────────────────────────────────

function StatBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxValue}>
        {value}
        {unit && <Text style={styles.statBoxUnit}> {unit}</Text>}
      </Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

// ─── Map Preview Style ────────────────────────────────────────

const mapPreviewStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F5F2FA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746B8C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#E8E1F8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D4E4F0' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#EFEAF8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#E8E1F8' }] },
];

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
  privacyReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5B2CFF10',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  privacyReminderText: {
    flex: 1,
    fontSize: 13,
    color: '#5B2CFF',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '900',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapContainer: {
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  mapPreview: {
    flex: 1,
  },
  emptyRouteState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  emptyRouteIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#5B2CFF12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRouteTextWrap: {
    flex: 1,
    gap: 4,
  },
  emptyRouteTitle: {
    color: '#18122B',
    fontSize: 15,
    fontWeight: '900',
  },
  emptyRouteSubtitle: {
    color: '#746B8C',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  statBoxValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -0.5,
  },
  statBoxUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#746B8C',
  },
  statBoxLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#746B8C',
    marginTop: 4,
  },
  controlsSection: {
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  consentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consentLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18122B',
  },
  consentStatus: {
    fontSize: 12,
    color: '#746B8C',
    fontWeight: '600',
  },
  consentToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F7F4FF',
  },
  consentToggleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#5B2CFF',
  },
  stoppedMessage: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  stoppedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18122B',
  },
  stoppedSubtitle: {
    fontSize: 14,
    color: '#746B8C',
    fontWeight: '600',
  },
  startPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#19C37D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  endPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5B2CFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  mediaMomentPin: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
    shadowColor: '#18122B',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  mediaMomentThumb: { width: '100%', height: '100%', borderRadius: 10 },
  mediaMomentVideo: {
    position: 'absolute',
    left: 13,
    top: 13,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,6,44,0.78)',
  },
  mediaMomentCount: {
    position: 'absolute',
    right: -7,
    top: -7,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#5B2CFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mediaMomentCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  photoPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EC3FA4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
