// ─── Location Types ───────────────────────────────────────────
// Shared types for location capture, consent, and route replay.

/** A single GPS point captured during an event. */
export interface LocationPoint {
  latitude: number;
  longitude: number;
  capturedAt: string;   // ISO 8601 timestamp
  placeLabel?: string;
  accuracyM?: number;
  speedMps?: number;    // metres per second
  altitudeM?: number;    // metres above sea level when device provides it
}

/** Capture lifecycle states. */
export type CaptureStatus =
  | 'idle'
  | 'requesting_consent'
  | 'capturing'
  | 'paused'
  | 'stopped';

/** A known place label used by route summaries. */
export interface PlaceEntry {
  lat: number;
  lng: number;
  label: string;
  type?: 'city' | 'town' | 'service_station' | 'viewpoint' | 'restaurant' | 'pub' | 'hotel' | 'home';
}

/** Private location detection result. */
export interface PrivateLocationFlag {
  lat: number;
  lng: number;
  occurrences: number;   // how many events share these coords
  isPrivate: boolean;
}
