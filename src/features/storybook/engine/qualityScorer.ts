// Quality Scorer — Quality score calculation
// 6 sub-scores, overall score, status, and improvement suggestions.

import { EngineInput, CuratedContent, ProcessedRoute, ScoredMediaItem, QualityScore, StorybookStatus } from './types';

/**
 * Calculate quality score from the pipeline results.
 * Pure function — no side effects.
 */
export function calculateQualityScore(
  input: EngineInput,
  curated: CuratedContent,
  route: ProcessedRoute,
  scoredMedia: ScoredMediaItem[],
): QualityScore {
  const visualImpact = scoreVisualImpact(curated);
  const narrativeFlow = scoreNarrativeFlow(curated, scoredMedia);
  const photoDiversity = scorePhotoDiversity(scoredMedia, input);
  const timelineCompleteness = scoreTimelineCompleteness(scoredMedia, input);
  const routeCompleteness = scoreRouteCompleteness(route, input);
  const shareability = scoreShareability(curated, scoredMedia, input);

  const overall = Math.round(
    visualImpact * 0.25 +
    narrativeFlow * 0.20 +
    photoDiversity * 0.15 +
    timelineCompleteness * 0.15 +
    routeCompleteness * 0.10 +
    shareability * 0.15,
  );

  const status: StorybookStatus =
    overall > 75 ? 'ready' :
    overall >= 60 ? 'good_with_suggestions' :
    'needs_more_content';

  return {
    visualImpact,
    narrativeFlow,
    photoDiversity,
    timelineCompleteness,
    routeCompleteness,
    shareability,
    overall,
    status,
  };
}

/**
 * Generate improvement suggestions based on quality score.
 */
export function generateSuggestions(
  quality: QualityScore,
  curated: CuratedContent,
  route: ProcessedRoute,
  mediaCount: number,
): string[] {
  if (quality.status === 'ready') {
    return [];
  }

  const suggestions: string[] = [];

  if (quality.visualImpact < 70) {
    if (mediaCount < 20) {
      suggestions.push('Add more photos to improve the visual quality of the storybook');
    } else {
      suggestions.push('Ask contributors to upload their best shots — higher quality photos will elevate the storybook');
    }
  }

  if (quality.narrativeFlow < 70) {
    suggestions.push('More photos spread across the full event duration would create a better narrative arc');
  }

  if (quality.photoDiversity < 70) {
    suggestions.push('Encourage more friends to share their photos — diversity of perspectives makes a richer story');
  }

  if (quality.timelineCompleteness < 70) {
    suggestions.push('Photos from the quieter moments of the event would fill timeline gaps');
  }

  if (quality.routeCompleteness < 70 && !route.hasRoute) {
    suggestions.push('Enable location sharing to unlock Route Replay — it adds a whole dimension to the story');
  } else if (quality.routeCompleteness < 70) {
    suggestions.push('More location points throughout the event would improve the route replay');
  }

  if (quality.shareability < 70) {
    suggestions.push('Add captions and reactions to make the storybook more shareable');
  }

  return suggestions;
}

// ─── Sub-scorers ───────────────────────────────────────────────

/**
 * Visual impact: average hero gallery overall score.
 */
function scoreVisualImpact(curated: CuratedContent): number {
  if (!curated.coverPhoto) return 0;
  if (curated.heroGallery.length === 0) return 0;
  const avg = curated.heroGallery.reduce((sum, item) => sum + item.score.overall, 0) / curated.heroGallery.length;
  return Math.round(avg);
}

/**
 * Narrative flow: based on hero gallery size, opening sequence, and content spread.
 */
function scoreNarrativeFlow(curated: CuratedContent, media: ScoredMediaItem[]): number {
  let score = 40; // base

  // Opening sequence quality
  if (curated.openingSequence.length >= 5) score += 15;
  else if (curated.openingSequence.length >= 3) score += 8;

  // Hero gallery size
  if (curated.heroGallery.length >= 15) score += 20;
  else if (curated.heroGallery.length >= 10) score += 12;
  else if (curated.heroGallery.length >= 6) score += 5;

  // Timeline highlights spread
  if (curated.timelineHighlights.length >= 3) score += 15;
  else if (curated.timelineHighlights.length >= 2) score += 8;

  // Cover photo quality
  if (curated.coverPhoto && curated.coverPhoto.score.overall > 75) score += 10;

  return clamp(score);
}

/**
 * Photo diversity: unique uploaders, time spread, location spread.
 */
function scorePhotoDiversity(media: ScoredMediaItem[], input: EngineInput): number {
  if (media.length === 0) return 0;

  // Unique uploaders (max 10 for scoring purposes)
  const uploaders = new Set(media.map((m) => m.uploaderName));
  const uploaderScore = Math.min(30, uploaders.size * 6);

  // Unique hours
  const hours = new Set(media.map((m) => m.capturedAt.slice(0, 13)));
  const hourScore = Math.min(30, hours.size * 4);

  // Unique locations (from GPS or place labels)
  const locations = new Set(
    media
      .filter((m) => m.placeLabel || (m.gpsLat != null && m.gpsLng != null))
      .map((m) => m.placeLabel ?? `${m.gpsLat},${m.gpsLng}`),
  );
  const locationScore = Math.min(25, locations.size * 5);

  // Orientation mix
  const orientations = new Set(
    media.map((m) => {
      if (!m.width || !m.height) return 'unknown';
      const ratio = m.width / m.height;
      return ratio > 1.1 ? 'landscape' : ratio < 0.9 ? 'portrait' : 'square';
    }),
  );
  const orientationScore = Math.min(15, orientations.size * 5);

  return clamp(uploaderScore + hourScore + locationScore + orientationScore);
}

/**
 * Timeline completeness: 100 - gap percentage.
 * For multi-day events (>24h), overnight gaps (10pm-8am) are weighted less severely.
 */
function scoreTimelineCompleteness(media: ScoredMediaItem[], input: EngineInput): number {
  if (media.length < 2) return 20;

  const sorted = [...media].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

  const eventStart = new Date(input.event.startsAt).getTime();
  const eventEnd = input.event.endsAt ? new Date(input.event.endsAt).getTime() : new Date(sorted[sorted.length - 1]!.capturedAt).getTime();
  const totalSpan = eventEnd - eventStart;

  if (totalSpan <= 0) return 50;

  const totalHours = totalSpan / 3600000;
  const isMultiDay = totalHours > 24;

  // Calculate gaps > 30 min
  let gapTime = 0;
  const gapThreshold = 30 * 60 * 1000;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]!.capturedAt).getTime();
    const curr = new Date(sorted[i]!.capturedAt).getTime();
    const gap = curr - prev;
    if (gap > gapThreshold) {
      // For multi-day events, reduce penalty for overnight gaps (22:00-08:00)
      let penalty = gap - gapThreshold;
      if (isMultiDay) {
        const prevDate = new Date(prev);
        const currDate = new Date(curr);
        const prevHour = prevDate.getHours();
        const currHour = currDate.getHours();
        // If gap spans overnight (sleep period), reduce penalty by 50%
        if (prevHour >= 21 || currHour <= 9) {
          // Calculate how much of the gap is overnight
          const overnightHours = Math.min(10, (curr - prev) / 3600000);
          penalty = penalty * (1 - 0.5 * Math.min(1, overnightHours / 8));
        }
      }
      gapTime += penalty;
    }
  }

  const gapPercentage = Math.min(100, (gapTime / totalSpan) * 100);
  return clamp(Math.round(100 - gapPercentage));
}

/**
 * Route completeness: route points / ideal (40+) × 100, or 100 if route disabled.
 */
function scoreRouteCompleteness(route: ProcessedRoute, input: EngineInput): number {
  if (!route.hasRoute) {
    // No route — if event type is road_trip, this hurts. Otherwise, neutral.
    if (input.event.type === 'road_trip' || input.event.type === 'group_holiday') {
      return 30;
    }
    return 70; // not all events need routes
  }

  const idealPoints = 40;
  const pointScore = Math.min(80, Math.round((route.points.length / idealPoints) * 80));
  const stopScore = Math.min(20, route.stops.length * 5);

  return clamp(pointScore + stopScore);
}

/**
 * Shareability: cover score + insight clarity + media count bonus.
 */
function scoreShareability(
  curated: CuratedContent,
  media: ScoredMediaItem[],
  input: EngineInput,
): number {
  let score = 40;

  // Cover photo quality
  if (curated.coverPhoto && curated.coverPhoto.score.overall > 80) score += 20;
  else if (curated.coverPhoto && curated.coverPhoto.score.overall > 65) score += 12;
  else if (curated.coverPhoto) score += 5;

  // Media count (more = more shareable)
  if (media.length >= 30) score += 15;
  else if (media.length >= 15) score += 10;
  else if (media.length >= 8) score += 5;

  // Captions (adds personality)
  const captionCount = input.captions.length;
  if (captionCount >= 8) score += 15;
  else if (captionCount >= 4) score += 8;
  else if (captionCount >= 1) score += 3;

  // Group shots (people love sharing group photos)
  const groupShots = media.filter((m) => m.isGroupShot).length;
  if (groupShots >= 3) score += 10;
  else if (groupShots >= 1) score += 5;

  return clamp(score);
}

// ─── Helpers ───────────────────────────────────────────────────

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
