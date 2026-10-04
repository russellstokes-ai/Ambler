export type RouteReplayScene = 'terrain' | 'city' | 'town' | 'journey' | 'venue' | 'standard';

export interface RouteMediaMoment {
  id: string;
  uri: string;
  storagePath?: string;
  thumbnailUri?: string;
  thumbnailPath?: string;
  mediaType: 'photo' | 'video';
  latitude: number;
  longitude: number;
  capturedAt: string;
  uploaderId?: string;
  uploaderName: string;
  placeLabel?: string;
  caption?: string;
  reactions?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  score?: number;
}

export interface RouteMediaCluster {
  id: string;
  latitude: number;
  longitude: number;
  moments: RouteMediaMoment[];
  primary: RouteMediaMoment;
}

interface RouteLike {
  totalDistanceKm?: number;
  elevationGainM?: number;
  highestElevationM?: number;
}

interface MediaLike {
  id: string;
  uri: string;
  storagePath?: string;
  thumbnailUri?: string;
  thumbnailPath?: string;
  mediaType: 'photo' | 'video';
  gpsLat?: number;
  gpsLng?: number;
  capturedAt: string;
  uploaderId?: string;
  uploaderName: string;
  placeLabel?: string;
  reactions?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  score?: { overall?: number };
}

const TERRAIN_EVENTS = new Set(['hiking_day', 'trekking', 'camping', 'ski_trip', 'backpacking', 'nature_walk']);
const CITY_EVENTS = new Set(['night_out', 'club_event', 'city_break', 'food_tour', 'shopping_day']);
const VENUE_EVENTS = new Set(['festival', 'theme_park', 'sports_event', 'concert', 'wedding']);
const JOURNEY_EVENTS = new Set(['road_trip', 'cycle_ride', 'run_walk', 'cruise', 'group_holiday']);

export function selectRouteReplayScene(eventType: string, route?: RouteLike): RouteReplayScene {
  if (TERRAIN_EVENTS.has(eventType) || (route?.elevationGainM ?? 0) >= 250) return 'terrain';
  if (CITY_EVENTS.has(eventType)) return 'city';
  if (VENUE_EVENTS.has(eventType)) return 'venue';
  if (JOURNEY_EVENTS.has(eventType) || (route?.totalDistanceKm ?? 0) >= 35) return 'journey';
  return 'town';
}

export function buildRouteMediaMoments(media: MediaLike[]): RouteMediaMoment[] {
  return media
    .filter((item) => Number.isFinite(item.gpsLat) && Number.isFinite(item.gpsLng))
    .map((item) => ({
      id: item.id,
      uri: item.uri,
      storagePath: item.storagePath,
      thumbnailUri: item.thumbnailUri ?? item.uri,
      thumbnailPath: item.thumbnailPath,
      mediaType: item.mediaType,
      latitude: item.gpsLat!,
      longitude: item.gpsLng!,
      capturedAt: item.capturedAt,
      uploaderId: item.uploaderId,
      uploaderName: item.uploaderName,
      placeLabel: item.placeLabel,
      reactions: item.reactions ?? 0,
      durationSeconds: item.durationSeconds,
      width: item.width,
      height: item.height,
      score: item.score?.overall ?? 0,
    }))
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
}

export function clusterRouteMediaMoments(
  moments: RouteMediaMoment[],
  radiusM = 75,
): RouteMediaCluster[] {
  const clusters: RouteMediaCluster[] = [];

  for (const moment of moments) {
    const cluster = clusters.find((candidate) => (
      distanceM(candidate.latitude, candidate.longitude, moment.latitude, moment.longitude) <= radiusM
    ));

    if (!cluster) {
      clusters.push({
        id: `route_cluster_${clusters.length + 1}`,
        latitude: moment.latitude,
        longitude: moment.longitude,
        moments: [moment],
        primary: moment,
      });
      continue;
    }

    cluster.moments.push(moment);
    const total = cluster.moments.length;
    cluster.latitude = ((cluster.latitude * (total - 1)) + moment.latitude) / total;
    cluster.longitude = ((cluster.longitude * (total - 1)) + moment.longitude) / total;
    cluster.primary = [...cluster.moments].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? cluster.primary;
  }

  return clusters;
}

function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radiusM = 6_371_000;
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return radiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
