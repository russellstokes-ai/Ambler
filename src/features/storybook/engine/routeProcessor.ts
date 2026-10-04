// Route Processor — Route simplification, stop detection, distance calculation
// Handles missing data gracefully, blurs private locations.

import { ScoredMediaItem } from './types';
import { EngineLocationPoint, PrivacySettings, ProcessedRoute, RoutePoint, RouteStop } from './types';

const MAX_POINTS = 60;
const STOP_RADIUS_M = 50;
const STOP_DURATION_MIN = 5;
const PHOTO_MATCH_TOLERANCE_SEC = 60;
const EARTH_RADIUS_KM = 6371;

/**
 * Process location points into a simplified route with stops and distance.
 * Pure function — no side effects.
 */
export function processRoute(
  locations: EngineLocationPoint[],
  media: ScoredMediaItem[],
  privacy: PrivacySettings,
): ProcessedRoute {
  if (locations.length === 0) {
    return {
      points: [],
      stops: [],
      totalDistanceKm: 0,
      totalDurationHours: 0,
      movingDurationHours: 0,
      averageMovingKph: 0,
      placesVisited: [],
      blurredPoints: [],
      hasRoute: false,
    };
  }

  // Sort by timestamp
  const sorted = [...locations].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

  // Convert to route points
  let routePoints: RoutePoint[] = sorted.map((l) => ({
    lat: l.latitude,
    lng: l.longitude,
    capturedAt: l.capturedAt,
  }));

  // Simplify to max points
  routePoints = simplifyRoute(routePoints, MAX_POINTS);

  // Blur private locations if needed
  let blurredPoints: RoutePoint[] = [];
  if (privacy.blurPrivateLocations) {
    const blurResult = blurPrivateLocations(routePoints);
    routePoints = blurResult.points;
    blurredPoints = blurResult.blurredPoints;
  }

  // Detect stops
  const stops = detectStops(routePoints, sorted, media);

  // Calculate total distance
  const totalDistanceKm = calculateTotalDistance(routePoints);

  // Calculate duration + truthful activity metrics from captured GPS.
  const totalDurationHours = calculateDurationHours(routePoints);
  const movement = calculateMovementMetrics(sorted);
  const elevation = calculateElevationMetrics(sorted);

  // Collect places visited
  const placesVisited = collectPlacesVisited(stops, sorted);

  return {
    points: routePoints,
    stops,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationHours: Math.round(totalDurationHours * 10) / 10,
    movingDurationHours: round1(movement.movingDurationHours),
    averageMovingKph: round1(movement.averageMovingKph),
    maxSpeedKph: movement.maxSpeedKph > 0 ? round1(movement.maxSpeedKph) : undefined,
    elevationGainM: elevation ? Math.round(elevation.gainM) : undefined,
    elevationLossM: elevation ? Math.round(elevation.lossM) : undefined,
    highestElevationM: elevation ? Math.round(elevation.highest.altitudeM) : undefined,
    lowestElevationM: elevation ? Math.round(elevation.lowest.altitudeM) : undefined,
    summit: elevation ? {
      lat: elevation.highest.latitude,
      lng: elevation.highest.longitude,
      altitudeM: Math.round(elevation.highest.altitudeM),
      capturedAt: elevation.highest.capturedAt,
      placeLabel: elevation.highest.placeLabel,
    } : undefined,
    placesVisited,
    blurredPoints,
    hasRoute: routePoints.length > 0,
  };
}

// ─── Route Simplification ──────────────────────────────────────

/**
 * Simplify route to max N points using step-based sampling.
 * Keeps first and last points, samples evenly in between.
 */
function simplifyRoute(points: RoutePoint[], maxPoints: number): RoutePoint[] {
  if (points.length <= maxPoints) return points;

  const result: RoutePoint[] = [points[0]!];
  const step = (points.length - 1) / (maxPoints - 1);

  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(points[index]!);
  }
  result.push(points[points.length - 1]!);
  return result;
}

// ─── Stop Detection ────────────────────────────────────────────

/**
 * Detect stops: clusters of points within STOP_RADIUS_M for > STOP_DURATION_MIN.
 */
function detectStops(
  points: RoutePoint[],
  rawLocations: EngineLocationPoint[],
  media: ScoredMediaItem[],
): RouteStop[] {
  if (points.length < 2) return [];

  const stops: RouteStop[] = [];
  let clusterStart = 0;

  for (let i = 1; i <= points.length; i++) {
    const isLast = i === points.length;
    const distance = isLast
      ? Infinity
      : haversineKm(points[clusterStart]!.lat, points[clusterStart]!.lng, points[i]!.lat, points[i]!.lng);

    if (distance > 0.05 || isLast) {
      // Check if this cluster was long enough to be a stop
      const clusterDurationMin =
        (new Date(points[i - 1]!.capturedAt).getTime() -
          new Date(points[clusterStart]!.capturedAt).getTime()) / 60000;

      if (clusterDurationMin >= STOP_DURATION_MIN && i - clusterStart >= 2) {
        const stopPoint = points[clusterStart]!;
        const placeLabel = findPlaceLabel(rawLocations, stopPoint);
        const bestPhoto = findBestPhotoAtLocation(media, stopPoint);

        stops.push({
          id: `stop_${stops.length + 1}`,
          lat: stopPoint.lat,
          lng: stopPoint.lng,
          placeLabel,
          durationMin: Math.round(clusterDurationMin),
          bestPhoto: bestPhoto ?? undefined,
          arrivalTime: stopPoint.capturedAt,
          departureTime: points[i - 1]!.capturedAt,
        });
      }
      clusterStart = i;
    }
  }

  return stops;
}

function findPlaceLabel(
  locations: EngineLocationPoint[],
  point: RoutePoint,
): string | undefined {
  // Find the nearest location point with a place label
  let closest: EngineLocationPoint | null = null;
  let minDist = Infinity;

  for (const loc of locations) {
    if (!loc.placeLabel) continue;
    const dist = haversineKm(point.lat, point.lng, loc.latitude, loc.longitude);
    if (dist < minDist) {
      minDist = dist;
      closest = loc;
    }
  }

  if (closest && minDist < 0.2) {
    return closest.placeLabel;
  }
  return undefined;
}

function findBestPhotoAtLocation(
  media: ScoredMediaItem[],
  point: RoutePoint,
): ScoredMediaItem | null {
  const pointTime = new Date(point.capturedAt).getTime();
  const tolerance = PHOTO_MATCH_TOLERANCE_SEC * 1000;

  let best: ScoredMediaItem | null = null;
  let bestScore = -1;

  for (const item of media) {
    if (item.gpsLat == null || item.gpsLng == null) continue;
    const dist = haversineKm(point.lat, point.lng, item.gpsLat, item.gpsLng);
    if (dist > 0.1) continue; // within 100m
    if (item.score.overall > bestScore) {
      bestScore = item.score.overall;
      best = item;
    }
  }

  // Fallback: match by timestamp
  if (!best) {
    for (const item of media) {
      const itemTime = new Date(item.capturedAt).getTime();
      if (Math.abs(itemTime - pointTime) <= tolerance) {
        if (item.score.overall > bestScore) {
          bestScore = item.score.overall;
          best = item;
        }
      }
    }
  }

  return best;
}

// ─── Distance Calculation ──────────────────────────────────────

/**
 * Haversine distance between two coordinates in kilometers.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function calculateTotalDistance(points: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(
      points[i - 1]!.lat,
      points[i - 1]!.lng,
      points[i]!.lat,
      points[i]!.lng,
    );
  }
  return total;
}

function calculateDurationHours(points: RoutePoint[]): number {
  if (points.length < 2) return 0;
  const start = new Date(points[0]!.capturedAt).getTime();
  const end = new Date(points[points.length - 1]!.capturedAt).getTime();
  return (end - start) / 3600000;
}



// ─── Activity Metrics ─────────────────────────────────────────

function calculateMovementMetrics(locations: EngineLocationPoint[]): {
  movingDurationHours: number;
  averageMovingKph: number;
  maxSpeedKph: number;
} {
  if (locations.length < 2) {
    return { movingDurationHours: 0, averageMovingKph: 0, maxSpeedKph: 0 };
  }

  let movingMs = 0;
  let movingDistanceKm = 0;
  let maxSpeedKph = 0;

  for (let i = 1; i < locations.length; i += 1) {
    const prev = locations[i - 1]!;
    const curr = locations[i]!;
    const dtMs = Date.parse(curr.capturedAt) - Date.parse(prev.capturedAt);
    if (dtMs <= 0 || dtMs > 10 * 60 * 1000) continue;

    const distanceKm = haversineKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    const segmentKph = distanceKm / (dtMs / 3_600_000);
    const capturedKph = curr.speedMps != null && curr.speedMps >= 0 ? curr.speedMps * 3.6 : 0;
    const speedKph = capturedKph > 0 ? capturedKph : segmentKph;

    // Reject obvious GPS jumps rather than turning them into impressive-looking stats.
    if (!Number.isFinite(speedKph) || speedKph > 220) continue;
    maxSpeedKph = Math.max(maxSpeedKph, speedKph);

    if (speedKph >= 1.8) { // ~0.5 m/s: walking pace or faster
      movingMs += dtMs;
      movingDistanceKm += distanceKm;
    }
  }

  const movingDurationHours = movingMs / 3_600_000;
  return {
    movingDurationHours,
    averageMovingKph: movingDurationHours > 0 ? movingDistanceKm / movingDurationHours : 0,
    maxSpeedKph,
  };
}

type ElevationPoint = EngineLocationPoint & { altitudeM: number };

function calculateElevationMetrics(locations: EngineLocationPoint[]): {
  gainM: number;
  lossM: number;
  highest: ElevationPoint;
  lowest: ElevationPoint;
} | null {
  const elevated = locations.filter(
    (point): point is ElevationPoint => point.altitudeM != null && Number.isFinite(point.altitudeM),
  );
  if (elevated.length < 4) return null;

  let gainM = 0;
  let lossM = 0;
  let highest = elevated[0]!;
  let lowest = elevated[0]!;

  for (let i = 1; i < elevated.length; i += 1) {
    const prev = elevated[i - 1]!;
    const curr = elevated[i]!;
    highest = curr.altitudeM > highest.altitudeM ? curr : highest;
    lowest = curr.altitudeM < lowest.altitudeM ? curr : lowest;

    const delta = curr.altitudeM - prev.altitudeM;
    // Ignore sub-3m noise from phone barometer/GPS altitude estimates.
    if (Math.abs(delta) < 3 || Math.abs(delta) > 300) continue;
    if (delta > 0) gainM += delta;
    else lossM += Math.abs(delta);
  }

  return { gainM, lossM, highest, lowest };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// ─── Places ────────────────────────────────────────────────────

function collectPlacesVisited(
  stops: RouteStop[],
  locations: EngineLocationPoint[],
): string[] {
  const places = new Set<string>();

  // From stops with labels
  for (const stop of stops) {
    if (stop.placeLabel) places.add(stop.placeLabel);
  }

  // From raw locations with labels
  for (const loc of locations) {
    if (loc.placeLabel) places.add(loc.placeLabel);
  }

  return Array.from(places);
}

// ─── Privacy: Blur Private Locations ───────────────────────────

/**
 * Blur private locations by simplifying coordinates near the start and end points.
 * These are likely home/work locations.
 */
function blurPrivateLocations(points: RoutePoint[]): {
  points: RoutePoint[];
  blurredPoints: RoutePoint[];
} {
  if (points.length < 3) return { points, blurredPoints: [] };

  const blurred: RoutePoint[] = [];
  const result = [...points];

  // Blur first 2 and last 2 points (likely home/departure)
  const blurIndices = [0, 1, points.length - 2, points.length - 1].filter(
    (i) => i >= 0 && i < points.length,
  );

  for (const idx of blurIndices) {
    const original = result[idx]!;
    const blurredPoint = blurCoordinates(original);
    blurred.push(original); // keep original in the private-location audit list
    result[idx] = blurredPoint;
  }

  return { points: result, blurredPoints: blurred };
}

/**
 * Blur coordinates to neighborhood level (~500m precision).
 * This approximates the area without revealing exact address.
 */
function blurCoordinates(point: RoutePoint): RoutePoint {
  // Round to ~3 decimal places (~110m precision) — neighborhood level
  const blurredLat = Math.round(point.lat * 1000) / 1000;
  const blurredLng = Math.round(point.lng * 1000) / 1000;
  return {
    ...point,
    lat: blurredLat,
    lng: blurredLng,
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
