// Media Scorer — Scores each photo/video 0-100
// Weighted: sharpness 25%, brightness 10%, vibrancy 15%, socialScore 20%, compositionScore 15%, temporalScore 15%

import { EngineMediaItem, MediaScore, ScoredMediaItem } from './types';

const FALLBACK = 60;

const WEIGHTS = {
  sharpness: 0.25,
  brightness: 0.10,
  vibrancy: 0.15,
  socialScore: 0.20,
  compositionScore: 0.15,
  temporalScore: 0.15,
} as const;

/**
 * Score a single media item. Pure function, no side effects.
 */
export function scoreMedia(
  item: EngineMediaItem,
  allMedia: EngineMediaItem[],
): MediaScore {
  const sharpness = clamp(item.sharpnessScore ?? FALLBACK);
  const brightness = scoreBrightness(item.brightnessScore ?? FALLBACK);
  const vibrancy = clamp(item.colorVibrancyScore ?? FALLBACK);
  const socialScore = scoreSocial(item);
  const compositionScore = scoreComposition(item);
  const temporalScore = scoreTemporal(item, allMedia);

  const overall = Math.round(
    sharpness * WEIGHTS.sharpness +
    brightness * WEIGHTS.brightness +
    vibrancy * WEIGHTS.vibrancy +
    socialScore * WEIGHTS.socialScore +
    compositionScore * WEIGHTS.compositionScore +
    temporalScore * WEIGHTS.temporalScore,
  );

  return {
    mediaId: item.id,
    sharpness,
    brightness,
    vibrancy,
    socialScore,
    compositionScore,
    temporalScore,
    overall: clamp(overall),
  };
}

/**
 * Score all media items. Returns sorted-by-overall-descending.
 */
export function scoreAllMedia(media: EngineMediaItem[]): ScoredMediaItem[] {
  const scored = media.map((item) => ({
    ...item,
    score: scoreMedia(item, media),
  }));
  return scored.sort((a, b) => b.score.overall - a.score.overall);
}

// ─── Sub-scorers ───────────────────────────────────────────────

/**
 * Brightness prefers mid-range values (not too dark, not too bright).
 * Input 0-100, output 0-100 with a bell curve centred at ~65.
 */
function scoreBrightness(raw: number): number {
  const ideal = 65;
  const distance = Math.abs(raw - ideal);
  // Full score at ideal, drops off at edges
  return clamp(Math.round(100 - distance * 1.5));
}

/**
 * Social score from reactions and comments.
 * reactions * 5 + comments * 3, capped at 100.
 */
function scoreSocial(item: EngineMediaItem): number {
  if (item.reactions == null && item.comments == null) {
    return FALLBACK;
  }

  const reactions = item.reactions ?? 0;
  const commentCount = item.comments?.length ?? 0;
  const raw = 20 + reactions * 7 + commentCount * 6;
  return clamp(Math.min(100, raw));
}

/**
 * Composition heuristic:
 * - Group shots get +15
 * - Face detected gets +5
 * - Landscape orientation gets +8 (better for full-bleed)
 * - Portrait gets +4
 * - Square gets +6 (versatile)
 * - Very wide/very tall panorama penalty
 */
function scoreComposition(item: EngineMediaItem): number {
  let score = FALLBACK;

  if (item.isGroupShot) score += 15;
  if (item.faceDetected) score += 5;

  if (item.width && item.height) {
    const ratio = item.width / item.height;
    if (ratio > 1.2 && ratio < 2.0) score += 8;       // landscape
    else if (ratio < 0.8 && ratio > 0.5) score += 4;   // portrait
    else if (ratio >= 0.8 && ratio <= 1.2) score += 6; // square
    else score -= 5;                                    // extreme panorama
  }

  // Video duration preference: 3-15s is ideal for highlights
  if (item.mediaType === 'video' && item.durationSeconds) {
    const dur = item.durationSeconds;
    if (dur >= 3 && dur <= 15) score += 10;
    else if (dur < 3) score -= 5;
    else if (dur > 15 && dur <= 30) score -= 3;
    else if (dur > 30) score -= 10;
  }

  return clamp(score);
}

/**
 * Temporal score: how well the photo represents its time period.
 * Photos near the peak density moment get higher scores.
 * Photos during "golden hour" (5-7pm) get a small bonus.
 */
function scoreTemporal(item: EngineMediaItem, allMedia: EngineMediaItem[]): number {
  if (allMedia.length === 0) return FALLBACK;

  const timestamps = allMedia.map((m) => new Date(m.capturedAt).getTime()).sort((a, b) => a - b);
  const itemTime = new Date(item.capturedAt).getTime();

  // Find density: count photos within ±10 minutes
  const tenMin = 10 * 60 * 1000;
  const nearbyCount = timestamps.filter(
    (t) => Math.abs(t - itemTime) <= tenMin,
  ).length;

  // More nearby photos = this is a happening moment
  const densityScore = Math.min(40, nearbyCount * 8);

  // Golden hour bonus
  const hour = new Date(item.capturedAt).getHours();
  let timeBonus = 0;
  if (hour >= 17 && hour <= 19) timeBonus = 15;  // golden hour
  else if (hour >= 20 && hour <= 22) timeBonus = 10; // evening magic
  else if (hour >= 7 && hour <= 9) timeBonus = 8;   // morning light

  // Position in event: middle 60% gets bonus
  const minTime = timestamps[0]!;
  const maxTime = timestamps[timestamps.length - 1]!;
  const eventSpan = maxTime - minTime || 1;
  const position = (itemTime - minTime) / eventSpan; // 0 to 1
  let positionBonus = 0;
  if (position >= 0.2 && position <= 0.8) positionBonus = 15;

  return clamp(Math.round(densityScore + timeBonus + positionBonus));
}

// ─── Helpers ───────────────────────────────────────────────────

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
