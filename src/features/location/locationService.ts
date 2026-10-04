import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { LocationPoint, PrivateLocationFlag } from './locationTypes';

export type LocationCaptureSubscription = Location.LocationSubscription;

interface DbLocationPoint {
  latitude: number | string;
  longitude: number | string;
  accuracy_m: number | string | null;
  captured_at: string;
  place_label: string | null;
  speed_mps: number | string | null;
  altitude_m: number | string | null;
}

export async function startCapture(
  eventId: string,
  onPoint: (point: LocationPoint) => void,
): Promise<LocationCaptureSubscription> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Location permission is required for Route Replay.');
  }

  const options: Location.LocationOptions & {
    foregroundService?: {
      notificationTitle: string;
      notificationBody: string;
      notificationColor?: string;
    };
  } = {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 5000,
    distanceInterval: 10,
    ...(Platform.OS === 'android'
      ? {
          foregroundService: {
            notificationTitle: 'Ambler route capture',
            notificationBody: 'Recording route points for your active event.',
            notificationColor: '#5B2CFF',
          },
        }
      : {}),
  };

  return Location.watchPositionAsync(
    options,
    async (location) => {
      const point = await locationObjectToPoint(location);
      const storedPoint = await storeRoutePoint(eventId, point);
      onPoint(storedPoint);
    },
  );
}

export function stopCapture(subscription: LocationCaptureSubscription | null): void {
  subscription?.remove();
}

export async function getRouteForEvent(eventId: string): Promise<LocationPoint[]> {
  const { data, error } = await supabase
    .from('location_points')
    .select('latitude, longitude, accuracy_m, captured_at, place_label, speed_mps, altitude_m')
    .eq('event_id', eventId)
    .order('captured_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapDbLocationPoint);
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  const first = results[0];
  if (!first) return undefined;

  return [
    first.name,
    first.street,
    first.district,
    first.city,
    first.region,
    first.country,
  ].filter(Boolean).join(', ') || undefined;
}

export async function storeRoutePoint(eventId: string, point: LocationPoint): Promise<LocationPoint> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const userId = authData.user?.id;
  if (!userId) throw new Error('You must be signed in to capture route points.');

  const protectedPoint = blurPrivateLocation(point);

  const { data, error } = await supabase
    .from('location_points')
    .insert({
      event_id: eventId,
      user_id: userId,
      latitude: protectedPoint.latitude,
      longitude: protectedPoint.longitude,
      accuracy_m: protectedPoint.accuracyM ?? null,
      captured_at: protectedPoint.capturedAt,
      place_label: protectedPoint.placeLabel ?? null,
      speed_mps: protectedPoint.speedMps ?? null,
      altitude_m: protectedPoint.altitudeM ?? null,
      is_private_blurred: protectedPoint.latitude !== point.latitude || protectedPoint.longitude !== point.longitude,
    })
    .select('latitude, longitude, accuracy_m, captured_at, place_label, speed_mps, altitude_m')
    .single();

  if (error) throw error;
  return mapDbLocationPoint(data as DbLocationPoint);
}

export function blurPrivateLocation(point: LocationPoint): LocationPoint {
  const label = point.placeLabel?.toLowerCase() ?? '';
  const looksResidential =
    /\b(home|flat|apartment|apt|house|residence|road|street|lane|drive|close|avenue)\b/.test(label) ||
    /\d/.test(label);

  if (!looksResidential) return point;

  return {
    ...point,
    latitude: Math.round(point.latitude * 1000) / 1000,
    longitude: Math.round(point.longitude * 1000) / 1000,
  };
}

export function detectPrivateLocations(
  routesByEvent: Record<string, LocationPoint[]>,
): PrivateLocationFlag[] {
  const coordMap = new Map<string, { lat: number; lng: number; count: number }>();

  for (const points of Object.values(routesByEvent)) {
    if (points.length === 0) continue;

    const endpoints = [points[0]!, points[points.length - 1]!];

    for (const ep of endpoints) {
      const key = `${Math.round(ep.latitude * 1000)}_${Math.round(ep.longitude * 1000)}`;
      const existing = coordMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        coordMap.set(key, { lat: ep.latitude, lng: ep.longitude, count: 1 });
      }
    }
  }

  const flags: PrivateLocationFlag[] = [];
  for (const { lat, lng, count } of coordMap.values()) {
    flags.push({
      lat,
      lng,
      occurrences: count,
      isPrivate: count >= 2,
    });
  }

  return flags;
}

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateRouteDistance(points: LocationPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(
      points[i - 1]!.latitude, points[i - 1]!.longitude,
      points[i]!.latitude, points[i]!.longitude,
    );
  }
  return Math.round(total * 10) / 10;
}

export function calculateRouteDuration(points: LocationPoint[]): number {
  if (points.length < 2) return 0;
  const start = new Date(points[0]!.capturedAt).getTime();
  const end = new Date(points[points.length - 1]!.capturedAt).getTime();
  return Math.round(((end - start) / 3600000) * 10) / 10;
}

export function countPlacesVisited(points: LocationPoint[]): string[] {
  const places = new Set<string>();
  for (const p of points) {
    if (p.placeLabel) places.add(p.placeLabel);
  }
  return Array.from(places);
}

export function detectStops(points: LocationPoint[]): { placeLabel: string; durationMin: number }[] {
  const stops: { placeLabel: string; durationMin: number }[] = [];
  let clusterStart = 0;

  for (let i = 1; i <= points.length; i++) {
    const isLast = i === points.length;
    const prev = points[clusterStart]!;
    const curr = isLast ? null : points[i]!;

    if (curr === null || (curr.speedMps !== undefined && curr.speedMps > 1) || prev.placeLabel !== curr?.placeLabel) {
      if (i - clusterStart >= 3) {
        const durationMin = Math.round(
          (new Date(points[i - 1]!.capturedAt).getTime() -
            new Date(prev.capturedAt).getTime()) / 60000,
        );
        if (durationMin >= 5) {
          stops.push({
            placeLabel: prev.placeLabel ?? 'Unknown',
            durationMin,
          });
        }
      }
      clusterStart = i;
    }
  }

  return stops;
}

async function locationObjectToPoint(location: Location.LocationObject): Promise<LocationPoint> {
  const placeLabel = await reverseGeocode(location.coords.latitude, location.coords.longitude).catch(() => undefined);
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    capturedAt: new Date(location.timestamp).toISOString(),
    placeLabel,
    accuracyM: location.coords.accuracy ?? undefined,
    speedMps: location.coords.speed ?? undefined,
    altitudeM: location.coords.altitude ?? undefined,
  };
}

function mapDbLocationPoint(row: DbLocationPoint): LocationPoint {
  return {
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    capturedAt: row.captured_at,
    placeLabel: row.place_label ?? undefined,
    accuracyM: row.accuracy_m == null ? undefined : Number(row.accuracy_m),
    speedMps: row.speed_mps == null ? undefined : Number(row.speed_mps),
    altitudeM: row.altitude_m == null ? undefined : Number(row.altitude_m),
  };
}
