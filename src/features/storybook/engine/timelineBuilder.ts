// Timeline Builder — deterministic chapter detection from time, place and capture rhythm.
// No generative AI is required: boundaries come from observable event data.

import { EventType } from '../../../types';
import { eventPhaseConfig } from '../../events/eventTypes';
import { ScoredMediaItem, TimelineChapter } from './types';
import { haversineKm } from './routeProcessor';

const MIN_PHOTOS_FOR_CHAPTERS = 8;
const MIN_CHAPTER_SIZE = 2;
const HIGHLIGHTS_PER_CHAPTER_MIN = 3;
const HIGHLIGHTS_PER_CHAPTER_MAX = 6;

interface BoundaryCandidate {
  index: number;
  score: number;
}

export function buildTimeline(
  media: ScoredMediaItem[],
  eventType: EventType,
  _eventStart?: string,
  _eventEnd?: string,
  maxChapters = 5,
): TimelineChapter[] {
  if (media.length === 0) return [];

  const sorted = [...media].sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));
  if (sorted.length < MIN_PHOTOS_FOR_CHAPTERS) return [buildChapter(sorted, phaseTitle(eventType, 0, 'The Highlights'), 0)];

  const candidates = findBoundaryCandidates(sorted)
    .filter((candidate) => candidate.score >= 2)
    .sort((a, b) => b.score - a.score);

  const picked: number[] = [];
  for (const candidate of candidates) {
    if (picked.length >= Math.max(1, maxChapters - 1)) break;
    if (candidate.index < MIN_CHAPTER_SIZE || sorted.length - candidate.index < MIN_CHAPTER_SIZE) continue;
    if (picked.some((idx) => Math.abs(idx - candidate.index) < MIN_CHAPTER_SIZE)) continue;
    picked.push(candidate.index);
  }
  picked.sort((a, b) => a - b);

  let segments = splitAtIndices(sorted, picked);
  if (segments.length < 2) segments = splitByTimeOfDay(sorted);
  if (segments.length < 2) segments = splitEvenly(sorted, Math.min(maxChapters, sorted.length >= 24 ? 3 : 2));
  segments = mergeTinySegments(segments);
  while (segments.length > maxChapters) segments = mergeSmallestAdjacent(segments);

  return segments.map((segment, index) => {
    const fallback = generateContextTitle(segment, index);
    return buildChapter(segment, phaseTitle(eventType, index, fallback), index);
  });
}

function findBoundaryCandidates(sorted: ScoredMediaItem[]): BoundaryCandidate[] {
  const result: BoundaryCandidate[] = [];

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]!;
    const curr = sorted[i]!;
    const gapMin = (Date.parse(curr.capturedAt) - Date.parse(prev.capturedAt)) / 60_000;
    let score = 0;

    if (gapMin >= 20) score += Math.min(5, gapMin / 20);
    if (prev.placeLabel && curr.placeLabel && prev.placeLabel !== curr.placeLabel) score += 2.4;

    if (prev.gpsLat != null && prev.gpsLng != null && curr.gpsLat != null && curr.gpsLng != null) {
      const distanceKm = haversineKm(prev.gpsLat, prev.gpsLng, curr.gpsLat, curr.gpsLng);
      if (distanceKm >= 0.5) score += Math.min(3, distanceKm / 2);
    }

    // Crossing a meaningful time-of-day boundary is useful when there is no big gap.
    if (timeOfDayLabel(new Date(prev.capturedAt).getHours()) !== timeOfDayLabel(new Date(curr.capturedAt).getHours())) {
      score += 0.8;
    }

    // A strong change in contributor can signal a new group/activity, but only lightly.
    if (prev.uploaderName !== curr.uploaderName && gapMin >= 8) score += 0.35;

    result.push({ index: i, score });
  }

  return result;
}

function splitAtIndices<T>(items: T[], indices: number[]): T[][] {
  if (indices.length === 0) return [items];
  const result: T[][] = [];
  let start = 0;
  for (const index of indices) {
    result.push(items.slice(start, index));
    start = index;
  }
  result.push(items.slice(start));
  return result.filter((segment) => segment.length > 0);
}

function splitByTimeOfDay(sorted: ScoredMediaItem[]): ScoredMediaItem[][] {
  const result: ScoredMediaItem[][] = [];
  let current: ScoredMediaItem[] = [];
  let label: string | null = null;

  for (const item of sorted) {
    const nextLabel = timeOfDayLabel(new Date(item.capturedAt).getHours());
    if (label != null && nextLabel !== label && current.length >= MIN_CHAPTER_SIZE) {
      result.push(current);
      current = [];
    }
    label = nextLabel;
    current.push(item);
  }
  if (current.length) result.push(current);
  return result;
}

function splitEvenly(sorted: ScoredMediaItem[], count: number): ScoredMediaItem[][] {
  if (count <= 1) return [sorted];
  const result: ScoredMediaItem[][] = [];
  for (let i = 0; i < count; i += 1) {
    const start = Math.floor((i * sorted.length) / count);
    const end = Math.floor(((i + 1) * sorted.length) / count);
    result.push(sorted.slice(start, end));
  }
  return result.filter((segment) => segment.length > 0);
}

function mergeTinySegments(segments: ScoredMediaItem[][]): ScoredMediaItem[][] {
  let result = [...segments];
  let changed = true;
  while (changed && result.length > 1) {
    changed = false;
    const tiny = result.findIndex((segment) => segment.length < MIN_CHAPTER_SIZE);
    if (tiny >= 0) {
      result = mergeAt(result, tiny);
      changed = true;
    }
  }
  return result;
}

function mergeSmallestAdjacent(segments: ScoredMediaItem[][]): ScoredMediaItem[][] {
  if (segments.length <= 1) return segments;
  let smallest = 0;
  for (let i = 1; i < segments.length; i += 1) {
    if (segments[i]!.length < segments[smallest]!.length) smallest = i;
  }
  return mergeAt(segments, smallest);
}

function mergeAt(segments: ScoredMediaItem[][], index: number): ScoredMediaItem[][] {
  const result = [...segments];
  if (index === 0) {
    result[0] = [...result[0]!, ...result[1]!];
    result.splice(1, 1);
  } else if (index === result.length - 1) {
    result[index - 1] = [...result[index - 1]!, ...result[index]!];
    result.splice(index, 1);
  } else if (result[index - 1]!.length <= result[index + 1]!.length) {
    result[index - 1] = [...result[index - 1]!, ...result[index]!];
    result.splice(index, 1);
  } else {
    result[index] = [...result[index]!, ...result[index + 1]!];
    result.splice(index + 1, 1);
  }
  return result;
}

function phaseTitle(eventType: EventType, index: number, fallback: string): string {
  return eventPhaseConfig[eventType]?.[index]?.label ?? fallback;
}

function generateContextTitle(segment: ScoredMediaItem[], index: number): string {
  const labels = segment.map((item) => item.placeLabel).filter(Boolean) as string[];
  if (labels.length) {
    const counts = new Map<string, number>();
    for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
    const place = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (place) return place.split(',')[0]!.trim();
  }
  const hour = new Date(segment[0]!.capturedAt).getHours();
  return timeOfDayLabel(hour) || `Chapter ${index + 1}`;
}

function timeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 11) return 'Morning';
  if (hour >= 11 && hour < 14) return 'Midday';
  if (hour >= 14 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 20) return 'Evening';
  if (hour >= 20 && hour < 23) return 'Night';
  return 'Late Night';
}

function buildChapter(media: ScoredMediaItem[], title: string, index: number): TimelineChapter {
  const sorted = [...media].sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));
  const startTime = sorted[0]!.capturedAt;
  const endTime = sorted[sorted.length - 1]!.capturedAt;
  const highlights = [...sorted]
    .sort((a, b) => b.score.overall - a.score.overall)
    .slice(0, Math.min(HIGHLIGHTS_PER_CHAPTER_MAX, Math.max(HIGHLIGHTS_PER_CHAPTER_MIN, Math.ceil(sorted.length / 5))));

  return {
    id: `chapter_${index + 1}`,
    title,
    timeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`,
    startTime,
    endTime,
    mediaCount: sorted.length,
    highlights,
    density: sorted.length > 15 ? 'dense' : sorted.length > 6 ? 'moderate' : 'sparse',
  };
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
