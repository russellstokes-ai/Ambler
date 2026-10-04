import { EventType } from '../../../types';
import { EngineInput, ScoredMediaItem, StoryLength } from './types';

export interface MediaBurst {
  id: string;
  startTime: string;
  endTime: string;
  mediaIds: string[];
  count: number;
  topUploader?: string;
}

export interface StoryPlan {
  length: StoryLength;
  maxChapters: number;
  openingCount: number;
  galleryCount: number;
  captionCount: number;
  includeRoute: boolean;
  includeInsights: boolean;
  includeCaptions: boolean;
  routeIsHero: boolean;
  pageDwellMs: number;
  bursts: MediaBurst[];
}

const ROUTE_HEAVY_EVENTS = new Set<EventType>([
  'road_trip',
  'group_holiday',
  'city_break',
  'backpacking_trip',
  'cruise',
  'ski_trip',
  'camping_trip',
  'hiking_day',
  'day_trip',
  'sports_trip',
  'match_day',
  'run_walk',
  'cycle_ride',
]);

export function resolveStoryLength(input: EngineInput): StoryLength {
  if (input.storyLength) return input.storyLength;

  const media = input.media.length;
  const captions = input.captions.length;
  const route = input.locations.length;
  const start = new Date(input.event.startsAt).getTime();
  const end = input.event.endsAt ? new Date(input.event.endsAt).getTime() : start;
  const durationHours = Math.max(0, (end - start) / 3_600_000);

  if (media >= 90 || durationHours >= 36 || (media >= 60 && captions >= 8)) return 'epic';
  if (media < 16 && route < 8 && captions < 3) return 'short';
  return 'standard';
}

export function planStory(input: EngineInput, scoredMedia: ScoredMediaItem[]): StoryPlan {
  const length = resolveStoryLength(input);
  const routeIsHero = ROUTE_HEAVY_EVENTS.has(input.event.type);
  const routeAvailable = input.locations.length >= 3;
  const bursts = detectMediaBursts(scoredMedia);

  if (length === 'short') {
    return {
      length,
      maxChapters: 3,
      openingCount: 4,
      galleryCount: Math.min(10, Math.max(6, scoredMedia.length)),
      captionCount: 4,
      includeRoute: routeAvailable && routeIsHero,
      includeInsights: scoredMedia.length >= 6,
      includeCaptions: input.captions.length > 0,
      routeIsHero,
      pageDwellMs: 3600,
      bursts,
    };
  }

  if (length === 'epic') {
    return {
      length,
      maxChapters: 7,
      openingCount: 8,
      galleryCount: Math.min(30, Math.max(18, Math.round(scoredMedia.length * 0.35))),
      captionCount: 14,
      includeRoute: routeAvailable,
      includeInsights: true,
      includeCaptions: input.captions.length > 0,
      routeIsHero,
      pageDwellMs: 5200,
      bursts,
    };
  }

  return {
    length,
    maxChapters: 5,
    openingCount: 6,
    galleryCount: Math.min(24, Math.max(12, Math.round(scoredMedia.length * 0.3))),
    captionCount: 9,
    includeRoute: routeAvailable && (routeIsHero || input.locations.length >= 10),
    includeInsights: true,
    includeCaptions: input.captions.length > 0,
    routeIsHero,
    pageDwellMs: 4400,
    bursts,
  };
}

/**
 * Detect dense capture bursts without AI. A burst is at least three items where
 * adjacent captures are no more than 90 seconds apart. These are useful for
 * montages and for identifying genuine peak moments.
 */
export function detectMediaBursts(media: ScoredMediaItem[], gapSeconds = 90): MediaBurst[] {
  if (media.length < 3) return [];
  const sorted = [...media].sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));
  const groups: ScoredMediaItem[][] = [];
  let current: ScoredMediaItem[] = [sorted[0]!];

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = Date.parse(sorted[i - 1]!.capturedAt);
    const next = Date.parse(sorted[i]!.capturedAt);
    if ((next - prev) / 1000 <= gapSeconds) {
      current.push(sorted[i]!);
    } else {
      if (current.length >= 3) groups.push(current);
      current = [sorted[i]!];
    }
  }
  if (current.length >= 3) groups.push(current);

  return groups.map((group, index) => {
    const counts = new Map<string, number>();
    for (const item of group) counts.set(item.uploaderName, (counts.get(item.uploaderName) ?? 0) + 1);
    const topUploader = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      id: `burst_${index + 1}`,
      startTime: group[0]!.capturedAt,
      endTime: group[group.length - 1]!.capturedAt,
      mediaIds: group.map((item) => item.id),
      count: group.length,
      topUploader,
    };
  });
}
