// Curator — Photo selection with taste
// Selects the best photos for each storybook section with diversity enforcement.

import { EngineEvent } from './types';
import { CuratedContent, ScoredMediaItem, ProcessedRoute, TimelineChapter } from './types';

/**
 * Curate content for all storybook sections.
 * Pure function — no side effects.
 */
export function curateContent(
  media: ScoredMediaItem[],
  chapters: TimelineChapter[],
  route: ProcessedRoute,
  _event: EngineEvent,
  plan?: StoryPlan,
): CuratedContent {
  if (media.length === 0) {
    return {
      coverPhoto: null,
      openingSequence: [],
      heroGallery: [],
      timelineHighlights: [],
      routePhotos: [],
      insightPhotos: {
        peakMoment: null,
        topContributor: null,
        bestGroupShot: null,
      },
    };
  }

  const sortedByScore = [...media].sort((a, b) => b.score.overall - a.score.overall);
  const sortedByTime = [...media].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

  const coverPhoto = selectCoverPhoto(sortedByScore, sortedByTime);
  const openingSequence = selectOpeningSequence(sortedByTime, sortedByScore, plan?.openingCount);
  const heroGallery = selectHeroGallery(sortedByScore, sortedByTime, plan?.galleryCount);
  const timelineHighlights = selectTimelineHighlights(chapters);
  const routePhotos = selectRoutePhotos(route, media);
  const insightPhotos = selectInsightPhotos(media, sortedByScore);

  return {
    coverPhoto,
    openingSequence,
    heroGallery,
    timelineHighlights,
    routePhotos,
    insightPhotos,
  };
}

// ─── Cover Photo ───────────────────────────────────────────────

/**
 * Cover: highest overall score, prefer landscape, prefer mid-event timeline.
 */
function selectCoverPhoto(
  byScore: ScoredMediaItem[],
  byTime: ScoredMediaItem[],
): ScoredMediaItem {
  if (byScore.length === 0) {
    return null as never;
  }

  if (byTime.length < 3) {
    return byScore[0]!;
  }

  // Define middle 60% of event timeline
  const minTime = new Date(byTime[0]!.capturedAt).getTime();
  const maxTime = new Date(byTime[byTime.length - 1]!.capturedAt).getTime();
  const span = maxTime - minTime;
  const midStart = minTime + span * 0.2;
  const midEnd = minTime + span * 0.8;

  // Score candidates: base overall + landscape bonus + mid-event bonus
  const candidates = byScore.slice(0, 15).map((item) => {
    let bonus = 0;
    // Landscape preference
    if (item.width && item.height) {
      const ratio = item.width / item.height;
      if (ratio > 1.2 && ratio < 2.0) bonus += 10;
    }
    // Mid-event bonus
    const itemTime = new Date(item.capturedAt).getTime();
    if (itemTime >= midStart && itemTime <= midEnd) bonus += 8;

    // Group shot bonus (good for cover)
    if (item.isGroupShot) bonus += 5;

    return { item, adjustedScore: item.score.overall + bonus };
  });

  candidates.sort((a, b) => b.adjustedScore - a.adjustedScore);
  return candidates[0]!.item;
}

// ─── Opening Sequence ──────────────────────────────────────────

/**
 * Opening: top 5-8 by score from first 30% of event, sorted by time.
 */
function selectOpeningSequence(
  byTime: ScoredMediaItem[],
  byScore: ScoredMediaItem[],
  targetOverride?: number,
): ScoredMediaItem[] {
  if (byTime.length === 0) return [];

  const minTime = new Date(byTime[0]!.capturedAt).getTime();
  const maxTime = new Date(byTime[byTime.length - 1]!.capturedAt).getTime();
  const span = maxTime - minTime || 1;
  const cutoff = minTime + span * 0.3;

  // Get photos from first 30% of event
  const firstPortion = byTime.filter(
    (item) => new Date(item.capturedAt).getTime() <= cutoff,
  );

  // If not enough in first 30%, take first 40%
  let pool = firstPortion;
  if (pool.length < 5) {
    const extendedCutoff = minTime + span * 0.4;
    pool = byTime.filter((item) => new Date(item.capturedAt).getTime() <= extendedCutoff);
  }

  // Take top by score, then re-sort by time
  const target = targetOverride ?? Math.min(8, Math.max(5, pool.length));
  const selected = [...pool]
    .sort((a, b) => b.score.overall - a.score.overall)
    .slice(0, Math.min(target, Math.max(1, pool.length)))
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());

  return selected;
}

// ─── Hero Gallery ──────────────────────────────────────────────

/**
 * Hero gallery: top 12-24 by score with diversity enforcement.
 * - Max 3 photos from same uploader
 * - Max 2 photos from same hour
 * - Prefer mix of orientations
 */
function selectHeroGallery(
  byScore: ScoredMediaItem[],
  byTime: ScoredMediaItem[],
  targetOverride?: number,
): ScoredMediaItem[] {
  if (byScore.length === 0) return [];

  const targetCount = Math.min(byScore.length, targetOverride ?? Math.min(24, Math.max(12, Math.floor(byScore.length * 0.6))));
  const result: ScoredMediaItem[] = [];
  const uploaderCounts: Record<string, number> = {};
  const hourCounts: Record<string, number> = {};
  let landscapeCount = 0;
  let portraitCount = 0;

  for (const item of byScore) {
    if (result.length >= targetCount) break;

    // Max 3 per uploader
    const uploader = item.uploaderName;
    if ((uploaderCounts[uploader] ?? 0) >= 3) continue;

    // Max 2 per hour
    const hourKey = item.capturedAt.slice(0, 13); // YYYY-MM-DDTHH
    if ((hourCounts[hourKey] ?? 0) >= 2) continue;

    // Orientation balance
    let orientation: 'landscape' | 'portrait' | 'square' = 'square';
    if (item.width && item.height) {
      const ratio = item.width / item.height;
      orientation = ratio > 1.1 ? 'landscape' : ratio < 0.9 ? 'portrait' : 'square';
    }

    // If we have too many of one orientation, skip
    if (orientation === 'landscape' && landscapeCount > portraitCount + 4) continue;
    if (orientation === 'portrait' && portraitCount > landscapeCount + 4) continue;

    result.push(item);
    uploaderCounts[uploader] = (uploaderCounts[uploader] ?? 0) + 1;
    hourCounts[hourKey] = (hourCounts[hourKey] ?? 0) + 1;
    if (orientation === 'landscape') landscapeCount++;
    else if (orientation === 'portrait') portraitCount++;
  }

  // If we didn't fill the quota, relax diversity rules
  const minimumCount = Math.min(targetCount, Math.min(12, byScore.length));
  if (result.length < minimumCount) {
    for (const item of byScore) {
      if (result.length >= minimumCount) break;
      if (result.some((r) => r.id === item.id)) continue;
      result.push(item);
    }
  }

  // Sort by time for display
  return result.sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );
}

// ─── Timeline Highlights ───────────────────────────────────────

/**
 * Timeline highlights: 2-3 per chapter, highest scored in that chapter.
 */
function selectTimelineHighlights(
  chapters: TimelineChapter[],
): { chapterId: string; photos: ScoredMediaItem[] }[] {
  return chapters.map((chapter) => {
    const count = Math.min(3, Math.max(2, Math.ceil(chapter.mediaCount / 8)));
    // chapter.highlights already has top by score, take the top N
    const photos = chapter.highlights.slice(0, count);
    return { chapterId: chapter.id, photos };
  });
}

// ─── Route Photos ──────────────────────────────────────────────

/**
 * Route photos: best photo at each stop.
 */
function selectRoutePhotos(
  route: ProcessedRoute,
  allMedia: ScoredMediaItem[],
): { stopId: string; photo: ScoredMediaItem }[] {
  const result: { stopId: string; photo: ScoredMediaItem }[] = [];

  for (const stop of route.stops) {
    if (stop.bestPhoto) {
      result.push({ stopId: stop.id, photo: stop.bestPhoto });
    } else {
      // Find best photo near this stop by timestamp
      const stopTime = new Date(stop.arrivalTime).getTime();
      const tolerance = 10 * 60 * 1000; // 10 minutes
      let best: ScoredMediaItem | null = null;
      let bestScore = -1;

      for (const item of allMedia) {
        const itemTime = new Date(item.capturedAt).getTime();
        if (Math.abs(itemTime - stopTime) > tolerance) continue;
        if (item.score.overall > bestScore) {
          bestScore = item.score.overall;
          best = item;
        }
      }

      if (best) {
        result.push({ stopId: stop.id, photo: best });
      }
    }
  }

  return result;
}

// ─── Insight Photos ────────────────────────────────────────────

/**
 * Insight photos: peak moment, top contributor, best group shot.
 */
function selectInsightPhotos(
  media: ScoredMediaItem[],
  byScore: ScoredMediaItem[],
): {
  peakMoment: ScoredMediaItem | null;
  topContributor: ScoredMediaItem | null;
  bestGroupShot: ScoredMediaItem | null;
} {
  // Peak moment: photo from highest-density time period
  const peakMoment = findPeakMomentPhoto(media);

  // Top contributor: best photo from the person who uploaded the most
  const uploaderCounts: Record<string, number> = {};
  for (const item of media) {
    uploaderCounts[item.uploaderName] = (uploaderCounts[item.uploaderName] ?? 0) + 1;
  }
  const topUploader = Object.entries(uploaderCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topContributor = topUploader
    ? byScore.find((item) => item.uploaderName === topUploader) ?? null
    : null;

  // Best group shot
  const groupShots = media.filter((m) => m.isGroupShot);
  const bestGroupShot = groupShots.length > 0
    ? groupShots.sort((a, b) => b.score.overall - a.score.overall)[0]!
    : null;

  return { peakMoment, topContributor, bestGroupShot };
}

/**
 * Find the photo from the highest-density time window (±10 min).
 */
function findPeakMomentPhoto(media: ScoredMediaItem[]): ScoredMediaItem | null {
  if (media.length === 0) return null;

  let bestWindowStart = 0;
  let bestWindowCount = 0;
  const tenMin = 10 * 60 * 1000;

  const sorted = [...media].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  );

  for (let i = 0; i < sorted.length; i++) {
    const windowStart = new Date(sorted[i]!.capturedAt).getTime();
    const count = sorted.filter(
      (m) => Math.abs(new Date(m.capturedAt).getTime() - windowStart) <= tenMin,
    ).length;
    if (count > bestWindowCount) {
      bestWindowCount = count;
      bestWindowStart = i;
    }
  }

  // Return the highest-scored photo in that peak window
  const peakTime = new Date(sorted[bestWindowStart]!.capturedAt).getTime();
  const windowPhotos = media.filter(
    (m) => Math.abs(new Date(m.capturedAt).getTime() - peakTime) <= tenMin,
  );
  return windowPhotos.sort((a, b) => b.score.overall - a.score.overall)[0]!;
}
