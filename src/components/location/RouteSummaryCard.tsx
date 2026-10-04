// ─── Route Summary Card ───────────────────────────────────────
// Displays route statistics with animated count-up.
// Used in event lobby and storybook.

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import MapView, { Polyline, Region } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { StatCounter } from '../core/StatCounter';
import { LocationPoint } from '../../features/location/locationTypes';
import {
  calculateRouteDistance,
  calculateRouteDuration,
  countPlacesVisited,
  detectStops,
} from '../../features/location/locationService';

interface RouteSummaryCardProps {
  route: LocationPoint[];
  /** Theme accent color for the route line and stats */
  accentColor?: string;
  /** Theme surface color for card background */
  surfaceColor?: string;
  /** Theme text color */
  textColor?: string;
  /** Theme muted text color */
  textMutedColor?: string;
  /** Whether to show the mini map preview */
  showMap?: boolean;
  /** Card style override */
  style?: ViewStyle;
  /** Stagger delay for entrance animation */
  delayMs?: number;
}

export function RouteSummaryCard({
  route,
  accentColor = '#5B2CFF',
  surfaceColor = '#FFFFFF',
  textColor = '#18122B',
  textMutedColor = '#746B8C',
  showMap = true,
  style,
  delayMs = 0,
}: RouteSummaryCardProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  // Calculate stats
  const stats = useMemo(() => {
    if (route.length === 0) {
      return { distanceKm: 0, durationHours: 0, placesCount: 0, stopsCount: 0 };
    }
    return {
      distanceKm: calculateRouteDistance(route),
      durationHours: calculateRouteDuration(route),
      placesCount: countPlacesVisited(route).length,
      stopsCount: detectStops(route).length,
    };
  }, [route]);

  // Map region
  const region = useMemo<Region | null>(() => {
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

  // Entrance animation
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 30);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delayMs, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (route.length === 0) {
    return null;
  }

  const polylineCoords = route.map(r => ({
    latitude: r.latitude,
    longitude: r.longitude,
  }));

  // Format duration nicely
  const durationLabel = stats.durationHours < 1
    ? `${Math.round(stats.durationHours * 60)}min`
    : `${stats.durationHours}h`;

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: surfaceColor },
        animatedStyle,
        style,
      ]}
    >
      {/* Mini Map */}
      {showMap && region && (
        <View style={styles.mapWrap}>
          <MapView
            style={styles.miniMap}
            region={region}
            showsTraffic={false}
            showsBuildings={false}
            showsCompass={false}
            rotateEnabled={false}
            pitchEnabled={false}
            scrollEnabled={false}
            zoomEnabled={false}
            customMapStyle={miniMapStyle}
          >
            {polylineCoords.length >= 2 && (
              <Polyline
                coordinates={polylineCoords}
                strokeColor={accentColor}
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </MapView>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="navigate-outline"
          label="Distance"
          value={stats.distanceKm}
          suffix=" km"
          accentColor={accentColor}
          textColor={textColor}
          textMutedColor={textMutedColor}
          delayMs={delayMs + 200}
        />
        <StatItem
          icon="time-outline"
          label="Duration"
          displayValue={durationLabel}
          accentColor={accentColor}
          textColor={textColor}
          textMutedColor={textMutedColor}
          delayMs={delayMs + 300}
        />
        <StatItem
          icon="location-outline"
          label="Places"
          value={stats.placesCount}
          accentColor={accentColor}
          textColor={textColor}
          textMutedColor={textMutedColor}
          delayMs={delayMs + 400}
        />
        <StatItem
          icon="flag-outline"
          label="Stops"
          value={stats.stopsCount}
          accentColor={accentColor}
          textColor={textColor}
          textMutedColor={textMutedColor}
          delayMs={delayMs + 500}
        />
      </View>
    </Animated.View>
  );
}

// ─── Stat Item ────────────────────────────────────────────────

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: number;
  displayValue?: string;
  suffix?: string;
  accentColor: string;
  textColor: string;
  textMutedColor: string;
  delayMs: number;
}

function StatItem({
  icon,
  label,
  value,
  displayValue,
  suffix = '',
  accentColor,
  textColor,
  textMutedColor,
  delayMs,
}: StatItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(delayMs).duration(400)}
      style={styles.statItem}
    >
      <View style={[styles.statIconWrap, { backgroundColor: accentColor + '15' }]}>
        <Ionicons name={icon} size={16} color={accentColor} />
      </View>
      {displayValue !== undefined ? (
        <Text style={[styles.statValue, { color: textColor }]}>
          {displayValue}
        </Text>
      ) : (
        <StatCounter
          value={value ?? 0}
          suffix={suffix}
          fontSize={22}
          color={textColor}
          fontWeight="900"
          durationMs={600}
        />
      )}
      <Text style={[styles.statLabel, { color: textMutedColor }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

// ─── Mini Map Style ───────────────────────────────────────────

const miniMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F0EDF8' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#E8E1F8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D4E4F0' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#EFEAF8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#E8E1F8' }] },
];

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  mapWrap: {
    height: 140,
    width: '100%',
    overflow: 'hidden',
  },
  miniMap: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    gap: 4,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});