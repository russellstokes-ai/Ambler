// Insight Generator — Story Insights generation
// Core insights + event-type-specific insights with theme-aware tone.

import { EventType, ThemeKey } from '../../../types';
import {
  EngineCaption,
  EngineEvent,
  GeneratedInsight,
  InsightTone,
  ProcessedRoute,
  ScoredMediaItem,
  TimelineChapter,
} from './types';
import { getStoryVibes } from './eventStoryContent';

// Event-type-specific insight configurations
interface EventTypeInsightConfig {
  insights: string[];  // insight keys to generate
  vibeLabels: string[];
}

const EVENT_TYPE_CONFIGS: Partial<Record<string, EventTypeInsightConfig>> = {
  road_trip: {
    insights: ['longestStop', 'bestRoadMoment'],
    vibeLabels: ['Road trip energy', 'Wanderlust', 'Miles of memories', 'Open road freedom'],
  },
  wedding: {
    insights: ['ceremonyTime', 'firstDance'],
    vibeLabels: ['Wedding magic', 'Forever starts here', 'Pure romance', 'A day to remember'],
  },
  festival: {
    insights: ['actsSeen', 'longestSet'],
    vibeLabels: ['Festival energy', 'Main stage magic', 'Bass and lights', 'Pure euphoria'],
  },
  birthday: {
    insights: ['cakeMoment', 'guestCount'],
    vibeLabels: ['Birthday joy', 'Celebration mode', 'Another year wiser', 'Party energy'],
  },
  stag: {
    insights: ['funniestMoment', 'award'],
    vibeLabels: ['Big night energy', 'Chaos controlled', 'Legendary night', 'No regrets'],
  },
  hen: {
    insights: ['funniestMoment', 'award'],
    vibeLabels: ['Big night energy', 'Fabulous chaos', 'Legendary night', 'Sparkle and shine'],
  },
  night_out: {
    insights: ['funniestMoment'],
    vibeLabels: ['Night energy', 'Good times only', 'City lights', 'Unforgettable'],
  },
  group_holiday: {
    insights: ['longestStop'],
    vibeLabels: ['Holiday vibes', 'Paradise found', 'Sun and fun', 'Escape energy'],
  },
  hiking_day: {
    insights: ['longestStop', 'movingPace', 'topContributor'],
    vibeLabels: ['Trail-day energy', 'Worth the climb', 'Fresh-air reset', 'Good tired'],
  },
  backpacking_trip: {
    insights: ['longestStop', 'movingPace', 'topContributor'],
    vibeLabels: ['Off-grid energy', 'Trail miles', 'Pack-on, world-off', 'Worth every step'],
  },
  sports_trip: {
    insights: ['longestStop', 'topContributor'],
    vibeLabels: ['Game-day energy', 'Worth the journey', 'Crowd alive', 'Team together'],
  },
  match_day: {
    insights: ['longestStop', 'topContributor'],
    vibeLabels: ['Game-day energy', 'Full-time memories', 'Colours on', 'Big-day atmosphere'],
  },
  sports_event: {
    insights: ['topContributor'],
    vibeLabels: ['Game-day energy', 'All eyes on the action', 'Team together', 'Crowd alive'],
  },
  group_workout: {
    insights: ['topContributor'],
    vibeLabels: ['Shared effort', 'Strong together', 'Good tired', 'Group-session energy'],
  },
  run_walk: {
    insights: ['movingPace', 'topContributor'],
    vibeLabels: ['Finish-line feeling', 'Shared effort', 'One step at a time', 'Good tired'],
  },
  cycle_ride: {
    insights: ['movingPace', 'longestStop', 'topContributor'],
    vibeLabels: ['Ride-day energy', 'Miles together', 'Two-wheel freedom', 'Worth the climb'],
  },
  fitness_challenge: {
    insights: ['topContributor'],
    vibeLabels: ['Challenge accepted', 'Strong together', 'Finish-line feeling', 'Earned, not staged'],
  },
};

// Theme tone mapping
type ThemeTone = 'emotional' | 'funny' | 'premium' | 'bold' | 'warm' | 'editorial';

const THEME_TONES: Record<ThemeKey, ThemeTone> = {
  cinematic: 'emotional',
  social_story: 'funny',
  wrapped: 'bold',
  route_replay: 'editorial',
  luxe: 'premium',
  confetti: 'funny',
  neon_pulse: 'bold',
  warm_gold: 'warm',
  retro_film: 'emotional',
  magazine: 'editorial',
  chaos: 'funny',
  family_keepsake: 'warm',
  minimal: 'premium',
};

/**
 * Generate all insights for an event.
 * Pure function — no side effects.
 */
export function generateInsights(
  event: EngineEvent,
  media: ScoredMediaItem[],
  route: ProcessedRoute,
  captions: EngineCaption[],
  chapters: TimelineChapter[],
  theme: ThemeKey,
): GeneratedInsight[] {
  const tone = THEME_TONES[theme] ?? 'emotional';
  const insights: GeneratedInsight[] = [];

  // ─── Core Insights ─────────────────────────────────
  insights.push(generateDurationInsight(event, tone));
  insights.push(generateMomentsInsight(media, tone));
  insights.push(generatePlacesInsight(route, tone));

  if (route.totalDistanceKm > 0) {
    insights.push(generateDistanceInsight(route, tone));
  }

  for (const activityInsight of generateActivityInsights(event, route)) {
    insights.push(activityInsight);
  }

  insights.push(generatePeakInsight(media, tone, chapters));
  insights.push(generateContributorsInsight(media, tone));
  insights.push(generateTopVibeInsight(event, media, tone));

  // ─── Event-Type-Specific Insights ──────────────────
  const eventConfig = EVENT_TYPE_CONFIGS[event.type];
  if (eventConfig) {
    for (const insightKey of eventConfig.insights) {
      const insight = generateEventSpecificInsight(insightKey, media, route, captions, event, tone);
      if (insight && !insights.some((existing) => existing.key === insight.key)) insights.push(insight);
    }
  }

  return insights;
}

// ─── Core Insight Generators ───────────────────────────────────

function generateDurationInsight(event: EngineEvent, tone: ThemeTone): GeneratedInsight {
  const duration = formatDuration(event.startsAt, event.endsAt);
  const labelMap: Record<ThemeTone, string> = {
    emotional: 'Time together',
    funny: 'How long it lasted',
    premium: 'Duration',
    bold: 'Total time',
    warm: 'Time spent together',
    editorial: 'Event duration',
  };
  return {
    key: 'duration',
    label: labelMap[tone],
    value: duration,
    tone: tone === 'bold' ? 'stat' : 'memory',
    emoji: '⏱️',
  };
}

function generateMomentsInsight(media: ScoredMediaItem[], tone: ThemeTone): GeneratedInsight {
  const labelMap: Record<ThemeTone, string> = {
    emotional: 'Moments to keep',
    funny: 'Moments added',
    premium: 'Moments added',
    bold: 'Moments added',
    warm: 'Memories made',
    editorial: 'Total moments',
  };
  return {
    key: 'moments',
    label: labelMap[tone],
    value: `${media.length}`,
    tone: 'stat',
    emoji: '📸',
  };
}

function generatePlacesInsight(route: ProcessedRoute, tone: ThemeTone): GeneratedInsight {
  const labelMap: Record<ThemeTone, string> = {
    emotional: 'Places in the story',
    funny: 'Places you ended up',
    premium: 'Places visited',
    bold: 'Places visited',
    warm: 'Places we went',
    editorial: 'Places',
  };
  return {
    key: 'places',
    label: labelMap[tone],
    value: `${route.placesVisited.length || 1}`,
    tone: 'stat',
    emoji: '📍',
  };
}

function generateDistanceInsight(route: ProcessedRoute, tone: ThemeTone): GeneratedInsight {
  const labelMap: Record<ThemeTone, string> = {
    emotional: 'The journey',
    funny: 'Ground you covered',
    premium: 'Distance covered',
    bold: 'Distance covered',
    warm: 'How far we went',
    editorial: 'Total distance',
  };
  return {
    key: 'distance',
    label: labelMap[tone],
    value: `${route.totalDistanceKm} km`,
    tone: 'stat',
    emoji: '🛣️',
  };
}

function generatePeakInsight(
  media: ScoredMediaItem[],
  tone: ThemeTone,
  _chapters: TimelineChapter[],
): GeneratedInsight {
  const peak = findPeakTime(media);
  const labelMap: Record<ThemeTone, string> = {
    emotional: 'The moment everything peaked',
    funny: 'When things got wild',
    premium: 'Peak moment',
    bold: 'Peak moment',
    warm: 'The best part of the day',
    editorial: 'Peak moment',
  };
  return {
    key: 'peak',
    label: labelMap[tone],
    value: peak,
    tone: tone === 'funny' ? 'fun' : 'memory',
    emoji: '🔥',
  };
}

function generateContributorsInsight(media: ScoredMediaItem[], tone: ThemeTone): GeneratedInsight {
  const uploaders = new Set(media.map((m) => m.uploaderName));
  const labelMap: Record<ThemeTone, string> = {
    emotional: 'The people who shared',
    funny: 'Friends who shared',
    premium: 'Contributors',
    bold: 'People who shared',
    warm: 'Everyone who shared',
    editorial: 'Contributors',
  };
  return {
    key: 'contributors',
    label: labelMap[tone],
    value: `${uploaders.size} ${uploaders.size === 1 ? 'person' : 'friends'}`,
    tone: 'stat',
    emoji: '👥',
  };
}

function generateTopVibeInsight(
  event: EngineEvent,
  media: ScoredMediaItem[],
  tone: ThemeTone,
): GeneratedInsight {
  const config = EVENT_TYPE_CONFIGS[event.type];
  const vibes = config?.vibeLabels ?? getStoryVibes(event.type);
  const vibe = vibes[Math.min(Math.floor(media.length / 10), vibes.length - 1)] ?? vibes[0]!;

  const labelMap: Record<ThemeTone, string> = {
    emotional: 'The feeling of it all',
    funny: 'The group vibe',
    premium: 'Signature vibe',
    bold: 'Top vibe',
    warm: 'The feeling we shared',
    editorial: 'Overall vibe',
  };
  return {
    key: 'topVibe',
    label: labelMap[tone],
    value: vibe,
    tone: 'fun',
    emoji: '✨',
  };
}

function generateActivityInsights(event: EngineEvent, route: ProcessedRoute): GeneratedInsight[] {
  if (!route.hasRoute) return [];
  const result: GeneratedInsight[] = [];
  const activityTypes = new Set<EventType>(['hiking_day', 'backpacking_trip', 'run_walk', 'cycle_ride', 'group_workout', 'fitness_challenge', 'ski_trip']);
  if (!activityTypes.has(event.type)) return result;

  if (route.movingDurationHours > 0) {
    result.push({
      key: 'movingTime',
      label: 'Moving time',
      value: formatHoursMinutes(route.movingDurationHours),
      tone: 'stat',
      emoji: '⏱️',
    });
  }

  const pace = generateMovingPaceInsight(route, event);
  if (pace) result.push(pace);

  if (route.elevationGainM != null && route.elevationGainM > 0) {
    result.push({
      key: 'elevationGain',
      label: 'Elevation gain',
      value: `${route.elevationGainM} m`,
      tone: 'stat',
      emoji: '⛰️',
    });
  }

  if (route.highestElevationM != null && route.summit) {
    result.push({
      key: 'highPoint',
      label: event.type === 'hiking_day' || event.type === 'backpacking_trip' ? 'High point' : 'Highest point',
      value: `${route.highestElevationM} m${route.summit.placeLabel ? ` · ${route.summit.placeLabel}` : ''}`,
      tone: 'stat',
      emoji: '🏔️',
    });
  }

  if (route.stops.length > 0) {
    result.push({
      key: 'stops',
      label: 'Stops',
      value: `${route.stops.length}`,
      tone: 'stat',
      emoji: '📍',
    });
  }

  if (route.maxSpeedKph != null && route.maxSpeedKph > 0 && (event.type === 'cycle_ride' || event.type === 'ski_trip')) {
    result.push({
      key: 'maxSpeed',
      label: 'Peak recorded speed',
      value: `${route.maxSpeedKph.toFixed(1)} km/h`,
      tone: 'stat',
      emoji: '⚡',
    });
  }

  return result;
}

function formatHoursMinutes(hours: number): string {
  const totalMin = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

// ─── Event-Specific Insight Generators ─────────────────────────

function generateEventSpecificInsight(
  key: string,
  media: ScoredMediaItem[],
  route: ProcessedRoute,
  captions: EngineCaption[],
  event: EngineEvent,
  tone: ThemeTone,
): GeneratedInsight | null {
  switch (key) {
    case 'longestStop':
      return generateLongestStopInsight(route, tone);
    case 'bestRoadMoment':
      return generateBestRoadMomentInsight(media, tone);
    case 'ceremonyTime':
      return generateCaptionedMomentInsight(captions, 'ceremony', 'Ceremony', '💍');
    case 'firstDance':
      return generateCaptionedMomentInsight(captions, 'first dance', 'First dance', '💃');
    case 'actsSeen':
      return generateActsSeenInsight(route, tone);
    case 'longestSet':
      return generateLongestSetInsight(route, tone);
    case 'cakeMoment':
      return generateCaptionedMomentInsight(captions, 'cake', 'Cake moment', '🎂');
    case 'guestCount':
      return generateGuestCountInsight(media, tone);
    case 'funniestMoment':
      return generateFunniestMomentInsight(media, captions, tone);
    case 'award':
      return generateAwardInsight(captions, media, tone);
    case 'movingPace':
      return generateMovingPaceInsight(route, event);
    case 'topContributor':
      return generateTopContributorInsight(media);
    default:
      return null;
  }
}

function generateLongestStopInsight(route: ProcessedRoute, tone: ThemeTone): GeneratedInsight | null {
  if (route.stops.length === 0) return null;
  const longest = [...route.stops].sort((a, b) => b.durationMin - a.durationMin)[0]!;
  return {
    key: 'longestStop',
    label: 'Longest stop',
    value: longest.placeLabel
      ? `${longest.placeLabel} (${longest.durationMin} min)`
      : `${longest.durationMin} min`,
    tone: 'stat',
    emoji: '🅿️',
  };
}

function generateBestRoadMomentInsight(
  media: ScoredMediaItem[],
  tone: ThemeTone,
): GeneratedInsight | null {
  // Best photo with GPS data that's not at a stop
  const withGps = media.filter((m) => m.gpsLat != null && m.gpsLng != null);
  if (withGps.length === 0) return null;
  const best = withGps.sort((a, b) => b.score.overall - a.score.overall)[0]!;
  return {
    key: 'bestRoadMoment',
    label: 'Top-rated road photo',
    value: best.placeLabel ?? formatTimeOfDay(best.capturedAt),
    tone: 'memory',
    emoji: '🚗',
  };
}

function generateCaptionedMomentInsight(
  captions: EngineCaption[],
  keyword: string,
  label: string,
  emoji: string,
): GeneratedInsight | null {
  const match = captions.find((caption) => caption.text.toLowerCase().includes(keyword.toLowerCase()));
  if (!match) return null;
  return {
    key: keyword.replace(/\s+/g, ''),
    label,
    value: formatTimeOfDay(match.createdAt),
    tone: 'memory',
    emoji,
  };
}

function stageStops(route: ProcessedRoute) {
  const stagePattern = /\b(stage|arena|tent|theatre|theater|hall)\b/i;
  return route.stops.filter((stop) => Boolean(stop.placeLabel && stagePattern.test(stop.placeLabel)));
}

function generateActsSeenInsight(route: ProcessedRoute, _tone: ThemeTone): GeneratedInsight | null {
  const stages = stageStops(route);
  if (stages.length === 0) return null;
  const uniqueStages = new Set(stages.map((stop) => stop.placeLabel?.trim()).filter(Boolean));
  return {
    key: 'actsSeen',
    label: 'Stage areas visited',
    value: `${uniqueStages.size}`,
    tone: 'stat',
    emoji: '🎸',
  };
}

function generateLongestSetInsight(route: ProcessedRoute, _tone: ThemeTone): GeneratedInsight | null {
  const stages = stageStops(route);
  if (stages.length === 0) return null;
  const longest = [...stages].sort((a, b) => b.durationMin - a.durationMin)[0]!;
  return {
    key: 'longestSet',
    label: 'Longest stage stop',
    value: longest.placeLabel
      ? `${longest.placeLabel} (${longest.durationMin} min)`
      : `${longest.durationMin} min`,
    tone: 'stat',
    emoji: '🎵',
  };
}

function generateGuestCountInsight(
  media: ScoredMediaItem[],
  _tone: ThemeTone,
): GeneratedInsight | null {
  const uploaders = new Set(media.map((m) => m.uploaderName).filter(Boolean));
  if (uploaders.size === 0) return null;
  return {
    key: 'guestCount',
    label: 'People who contributed',
    value: `${uploaders.size}`,
    tone: 'stat',
    emoji: '🥂',
  };
}

function generateFunniestMomentInsight(
  _media: ScoredMediaItem[],
  captions: EngineCaption[],
  _tone: ThemeTone,
): GeneratedInsight | null {
  // Only surface humour when the contributor actually signalled it in their own caption.
  const laughter = /(😂|🤣|\blol\b|\blmao\b|\bhaha+\b|\bhehe+\b)/i;
  const match = captions.find((caption) => caption.text.length <= 120 && laughter.test(caption.text));
  if (!match) return null;
  return {
    key: 'funniestMoment',
    label: 'A laugh from the group',
    value: `“${match.text}”`,
    tone: 'fun',
    emoji: '😂',
  };
}

function generateAwardInsight(
  captions: EngineCaption[],
  media: ScoredMediaItem[],
  tone: ThemeTone,
): GeneratedInsight | null {
  // Factual contributor count — no subjective award inference.
  const uploaders: Record<string, number> = {};
  for (const m of media) {
    if (!m.uploaderName) continue;
    uploaders[m.uploaderName] = (uploaders[m.uploaderName] ?? 0) + 1;
  }
  const topUploader = Object.entries(uploaders).sort((a, b) => b[1] - a[1])[0];
  if (!topUploader) return null;
  return {
    key: 'award',
    label: 'Most moments shared',
    value: `${topUploader[0]} (${topUploader[1]} photos)`,
    tone: 'fun',
    emoji: '🏆',
  };
}

function generateMovingPaceInsight(
  route: ProcessedRoute,
  event: EngineEvent,
): GeneratedInsight | null {
  if (route.totalDistanceKm <= 0 || route.movingDurationHours <= 0) return null;

  if (event.type === 'cycle_ride') {
    const speed = route.averageMovingKph || route.totalDistanceKm / route.movingDurationHours;
    return {
      key: 'pace',
      label: 'Average route speed',
      value: `${speed.toFixed(1)} km/h`,
      tone: 'stat',
      emoji: '🚴',
    };
  }

  const minutesPerKm = (route.movingDurationHours * 60) / route.totalDistanceKm;
  const min = Math.floor(minutesPerKm);
  const sec = Math.round((minutesPerKm - min) * 60);
  return {
    key: 'movingPace',
    label: event.type === 'hiking_day' || event.type === 'backpacking_trip' ? 'Average trail pace' : 'Average pace',
    value: `${min}:${sec.toString().padStart(2, '0')} /km`,
    tone: 'stat',
    emoji: event.type === 'hiking_day' || event.type === 'backpacking_trip' ? '🥾' : '🏃',
  };
}

function generateTopContributorInsight(media: ScoredMediaItem[]): GeneratedInsight | null {
  const counts = new Map<string, number>();
  for (const item of media) {
    const name = item.uploaderName?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return {
    key: 'topContributor',
    label: 'Most moments shared',
    value: `${top[0]} · ${top[1]} ${top[1] === 1 ? 'moment' : 'moments'}`,
    tone: 'stat',
    emoji: '📷',
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function formatDuration(startsAt: string, endsAt?: string): string {
  if (!endsAt) return 'Live';
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const hours = Math.max(1, Math.round((end - start) / 3600000));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  return `${hours}h`;
}

function findPeakTime(media: ScoredMediaItem[]): string {
  if (media.length === 0) return 'Unknown';
  const sorted = [...media].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );
  const tenMin = 10 * 60 * 1000;
  let bestTime = new Date(sorted[Math.floor(sorted.length * 0.65)]!.capturedAt);
  let bestCount = 0;

  for (const item of sorted) {
    const time = new Date(item.capturedAt).getTime();
    const count = sorted.filter(
      (m) => Math.abs(new Date(m.capturedAt).getTime() - time) <= tenMin,
    ).length;
    if (count > bestCount) {
      bestCount = count;
      bestTime = new Date(item.capturedAt);
    }
  }

  return formatTimeOfDay(bestTime.toISOString());
}

function formatTimeOfDay(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}
