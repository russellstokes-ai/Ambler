// Music Selector — Music selection based on theme, event energy, and event type
// Maps theme → music category, detects energy, refines by event type.

import { EventType, ThemeKey } from '../../../types';
import { EnergyLevel, EmotionalArc, MusicSelection, ScoredMediaItem, TimelineChapter } from './types';

// Music track catalog
interface Track {
  trackId: string;
  trackName: string;
  category: string;
  durationSeconds: number;
  bpm: number;
  energyLevel: EnergyLevel;
  emotionalArc: EmotionalArc;
}

const TRACK_CATALOG: Track[] = [
  { trackId: 'cinematic-1', trackName: 'Swelling Dawn', category: 'cinematic', durationSeconds: 180, bpm: 72, energyLevel: 'low', emotionalArc: 'building' },
  { trackId: 'cinematic-2', trackName: 'Slow Motion Memory', category: 'cinematic', durationSeconds: 200, bpm: 65, energyLevel: 'low', emotionalArc: 'winding' },
  { trackId: 'cinematic-3', trackName: 'Epic Crescendo', category: 'cinematic', durationSeconds: 240, bpm: 90, energyLevel: 'high', emotionalArc: 'peaking' },
  { trackId: 'upbeat-1', trackName: 'Friday Feeling', category: 'upbeat', durationSeconds: 180, bpm: 120, energyLevel: 'high', emotionalArc: 'peaking' },
  { trackId: 'upbeat-2', trackName: 'Festival Anthem', category: 'upbeat', durationSeconds: 200, bpm: 128, energyLevel: 'high', emotionalArc: 'steady' },
  { trackId: 'upbeat-3', trackName: 'Good Times Only', category: 'upbeat', durationSeconds: 175, bpm: 115, energyLevel: 'high', emotionalArc: 'peaking' },
  { trackId: 'chilled-1', trackName: 'Golden Hour', category: 'chilled', durationSeconds: 210, bpm: 80, energyLevel: 'low', emotionalArc: 'steady' },
  { trackId: 'chilled-2', trackName: 'Late Night Drive', category: 'chilled', durationSeconds: 220, bpm: 75, energyLevel: 'low', emotionalArc: 'winding' },
  { trackId: 'luxe-1', trackName: 'String Quartet', category: 'luxe', durationSeconds: 240, bpm: 68, energyLevel: 'low', emotionalArc: 'steady' },
  { trackId: 'luxe-2', trackName: 'Piano Nocturne', category: 'luxe', durationSeconds: 220, bpm: 60, energyLevel: 'low', emotionalArc: 'winding' },
  { trackId: 'retro-1', trackName: '80s Synth Dream', category: 'retro', durationSeconds: 210, bpm: 95, energyLevel: 'medium', emotionalArc: 'building' },
  { trackId: 'retro-2', trackName: 'Disposable Camera', category: 'retro', durationSeconds: 190, bpm: 82, energyLevel: 'medium', emotionalArc: 'steady' },
  { trackId: 'playful-1', trackName: 'Chaos Mode', category: 'playful', durationSeconds: 170, bpm: 140, energyLevel: 'high', emotionalArc: 'peaking' },
  { trackId: 'playful-3', trackName: 'Social Story Pop', category: 'playful', durationSeconds: 175, bpm: 118, energyLevel: 'medium', emotionalArc: 'building' },
  { trackId: 'sentimental-1', trackName: 'Family Keepsake', category: 'sentimental', durationSeconds: 230, bpm: 68, energyLevel: 'low', emotionalArc: 'building' },
];

// Theme → preferred music categories
const THEME_CATEGORIES: Record<ThemeKey, string[]> = {
  cinematic: ['cinematic', 'chilled'],
  social_story: ['playful'],
  wrapped: ['playful'],
  route_replay: ['cinematic', 'chilled'],
  luxe: ['luxe'],
  confetti: ['upbeat', 'playful'],
  neon_pulse: ['upbeat', 'playful'],
  warm_gold: ['chilled', 'upbeat'],
  retro_film: ['retro'],
  magazine: ['chilled', 'luxe'],
  chaos: ['playful'],
  family_keepsake: ['sentimental'],
  minimal: ['chilled'],
};

// Event type → preferred categories (refines within theme)
const EVENT_TYPE_PREFERENCES: Partial<Record<string, string[]>> = {
  wedding: ['sentimental', 'luxe'],
  festival: ['upbeat', 'playful'],
  road_trip: ['cinematic', 'chilled'],
  night_out: ['playful', 'upbeat'],
  birthday: ['upbeat', 'playful'],
  stag: ['playful', 'upbeat'],
  hen: ['playful', 'upbeat'],
  family_gathering: ['sentimental', 'chilled'],
  graduation: ['cinematic', 'upbeat'],
  hiking_day: ['cinematic', 'chilled'],
  backpacking_trip: ['cinematic', 'chilled'],
  sports_trip: ['upbeat', 'playful'],
  match_day: ['upbeat', 'playful'],
  sports_event: ['upbeat', 'playful'],
  group_workout: ['upbeat', 'playful'],
  run_walk: ['upbeat', 'cinematic'],
  cycle_ride: ['upbeat', 'cinematic'],
  fitness_challenge: ['upbeat', 'cinematic'],
  ski_trip: ['upbeat', 'cinematic'],
  cruise: ['cinematic', 'luxe'],
  camping_trip: ['cinematic', 'chilled'],
  theme_park_day: ['playful', 'upbeat'],
};

/**
 * Select music based on theme, event energy, and event type.
 * Pure function — no side effects.
 */
export function selectMusic(
  theme: ThemeKey,
  eventType: EventType,
  media: ScoredMediaItem[],
  chapters: TimelineChapter[],
): MusicSelection {
  // 1. Detect event energy from photo density and timeline
  const energy = detectEventEnergy(media, chapters);

  // 2. Get theme-preferred categories
  const themeCategories = THEME_CATEGORIES[theme] ?? ['cinematic'];

  // 3. Get event-type preferences
  const eventPrefs = EVENT_TYPE_PREFERENCES[eventType] ?? [];

  // 4. Merge: event prefs take priority if they intersect with theme categories
  let candidateTracks: Track[];
  const intersection = eventPrefs.filter((c) => themeCategories.includes(c));

  if (intersection.length > 0) {
    candidateTracks = TRACK_CATALOG.filter((t) => intersection.includes(t.category));
  } else {
    // Use theme categories, optionally refined by event prefs
    candidateTracks = TRACK_CATALOG.filter((t) => themeCategories.includes(t.category));
    if (eventPrefs.length > 0) {
      // Add event-pref tracks as alternatives
    }
  }

  if (candidateTracks.length === 0) {
    candidateTracks = TRACK_CATALOG.filter((t) => themeCategories.includes(t.category));
  }

  // 5. Filter by energy level
  const energyMatches = candidateTracks.filter((t) => t.energyLevel === energy);
  const finalCandidates = energyMatches.length > 0 ? energyMatches : candidateTracks;

  // 6. Pick a stable but varied match. The same captured story keeps the same soundtrack.
  const seed = `${theme}:${eventType}:${media.slice(0, 12).map((item) => item.id).join('|')}`;
  const selected = finalCandidates[stableIndex(seed, finalCandidates.length)] ?? TRACK_CATALOG[0]!;

  return {
    trackId: selected.trackId,
    trackName: selected.trackName,
    category: selected.category,
    durationSeconds: selected.durationSeconds,
    bpm: selected.bpm,
    energyLevel: selected.energyLevel,
    emotionalArc: selected.emotionalArc,
  };
}

function stableIndex(seed: string, length: number): number {
  if (length <= 1) return 0;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

// ─── Energy Detection ──────────────────────────────────────────

/**
 * Detect event energy from photo density and timeline.
 * - High photo density + short duration = high energy
 * - Low photo density + long duration = low energy
 * - Mixed = medium energy
 */
function detectEventEnergy(
  media: ScoredMediaItem[],
  chapters: TimelineChapter[],
): EnergyLevel {
  if (media.length === 0) return 'low';

  // Calculate photo density (photos per hour)
  if (chapters.length === 0) return 'low';

  const totalDurationMs =
    new Date(chapters[chapters.length - 1]!.endTime).getTime() -
    new Date(chapters[0]!.startTime).getTime();
  const totalHours = Math.max(1, totalDurationMs / 3600000);
  const density = media.length / totalHours;

  // High density = high energy
  if (density > 8) return 'high';
  if (density > 3) return 'medium';
  return 'low';
}
