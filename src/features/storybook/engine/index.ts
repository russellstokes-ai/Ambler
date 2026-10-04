// Storybook Engine — Main Orchestrator
// Runs all pipeline stages in order and assembles the final storybook.

import { Storybook, StorybookPage } from '../../../types';
import { ThemeKey } from '../../../types';
import {
  CuratedContent,
  EngineInput,
  GeneratedInsight,
  GeneratedStorybook,
  ProcessedRoute,
  QualityScore,
  ScoredMediaItem,
  StorybookCopy,
  StorybookStatus,
  TimelineChapter,
} from './types';
import { scoreAllMedia } from './mediaScorer';
import { buildTimeline } from './timelineBuilder';
import { processRoute } from './routeProcessor';
import { curateContent } from './curator';
import { generateInsights } from './insightGenerator';
import { generateCopy } from './copyGenerator';
import { calculateQualityScore, generateSuggestions } from './qualityScorer';
import { applyTheme, getEngineThemeConfig } from './themeApplier';
import { selectMusic } from './musicSelector';
import { planStory, StoryPlan } from './storyPlanner';
import { buildRouteMediaMoments, selectRouteReplayScene } from '../../location/routeReplayV2';

/**
 * Generate a complete storybook from raw event data.
 * This is the main entry point for the engine pipeline.
 */
export async function generateStorybook(input: EngineInput): Promise<GeneratedStorybook> {
  // 1. Score all media
  const scoredMedia = scoreAllMedia(input.media);

  // 2. Plan story length/pacing from real content, then build chapters.
  const storyPlan = planStory(input, scoredMedia);
  const chapters = buildTimeline(
    scoredMedia,
    input.event.type,
    input.event.startsAt,
    input.event.endsAt,
    storyPlan.maxChapters,
  );

  // 3. Process route
  const route = processRoute(input.locations, scoredMedia, input.privacySettings);

  // 4. Curate content
  const curated = curateContent(scoredMedia, chapters, route, input.event, storyPlan);

  // 5. Generate insights
  const insights = generateInsights(
    input.event,
    scoredMedia,
    route,
    input.captions,
    chapters,
    input.theme,
  );

  // 6. Generate copy
  const keyStat = buildKeyStat(input, insights);
  const copy = generateCopy(input.event, input.theme, keyStat);

  // 7. Assemble pages
  const pages = assemblePages(curated, chapters, route, insights, copy, input, storyPlan, scoredMedia);

  // 8. Apply theme
  const themeConfig = getEngineThemeConfig(input.theme);
  const themedPages = applyTheme(pages, themeConfig);

  // 9. Calculate quality score
  const qualityScore = calculateQualityScore(input, curated, route, scoredMedia);

  // 10. Select music
  const musicSelection = selectMusic(input.theme, input.event.type, scoredMedia, chapters);

  // 11. Determine status
  const status: StorybookStatus = qualityScore.overall > 75 ? 'ready' : qualityScore.overall >= 60 ? 'good_with_suggestions' : 'needs_more_content';

  // 12. Generate suggestions
  const suggestions = generateSuggestions(qualityScore, curated, route, input.media.length);

  // 13. Assemble final storybook
  const storybook: Storybook = {
    id: `storybook_${input.event.id}`,
    eventId: input.event.id,
    title: copy.cover.title,
    qualityScore: {
      visualImpact: qualityScore.visualImpact,
      narrativeFlow: qualityScore.narrativeFlow,
      photoDiversity: qualityScore.photoDiversity,
      timelineCompleteness: qualityScore.timelineCompleteness,
      routeCompleteness: qualityScore.routeCompleteness,
      shareability: qualityScore.shareability,
    },
    pages: themedPages,
    musicSelection,
  };

  return {
    storybook,
    status,
    suggestions,
    insights,
    curated,
    route,
    chapters,
  };
}

// ─── Page Assembly ─────────────────────────────────────────────

/**
 * Assemble all storybook pages from curated content and metadata.
 */
function assemblePages(
  curated: CuratedContent,
  chapters: TimelineChapter[],
  route: ProcessedRoute,
  insights: GeneratedInsight[],
  copy: StorybookCopy,
  input: EngineInput,
  plan: StoryPlan,
  scoredMedia: ScoredMediaItem[],
): StorybookPage[] {
  const pages: StorybookPage[] = [];

  // 1. Cover Page
  pages.push({
    id: 'cover',
    type: 'cover',
    title: copy.cover.title,
    subtitle: copy.cover.subtitle,
    data: {
      heroMedia: curated.coverPhoto,
      eventLocation: input.event.locationLabel,
      eventDate: input.event.startsAt,
      insightTeasers: insights.slice(0, 4),
      storyLength: plan.length,
      pacingMs: plan.pageDwellMs,
    },
  });

  // 2. Cinematic Opening
  pages.push({
    id: 'cinematic-opening',
    type: 'cinematic_opening',
    title: copy.opening.title,
    subtitle: copy.opening.subtitle,
    data: {
      media: curated.openingSequence,
      kicker: copy.opening.kicker,
      bursts: plan.bursts.slice(0, plan.length === 'epic' ? 5 : 3),
    },
  });

  // 3. Timeline
  pages.push({
    id: 'timeline',
    type: 'timeline',
    title: copy.timeline.title,
    subtitle: copy.timeline.subtitle,
    data: {
      chapters: chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        timeRange: ch.timeRange,
        startTime: ch.startTime,
        endTime: ch.endTime,
        mediaCount: ch.mediaCount,
        density: ch.density,
        highlights: ch.highlights,
      })),
      timelineHighlights: curated.timelineHighlights,
      kicker: copy.timeline.kicker,
    },
  });

  // 4. Route Replay — only include it when route data is genuinely useful.
  if (plan.includeRoute && route.hasRoute) {
    pages.push({
      id: 'route-replay',
      type: 'route_replay',
      title: copy.routeReplay.title,
      subtitle: copy.routeReplay.subtitle,
      data: {
        route,
        routePhotos: curated.routePhotos,
        routeMedia: buildRouteMediaMoments(scoredMedia),
        routeReplayScene: selectRouteReplayScene(input.event.type, route),
        insights: insights.filter((i) => ['distance', 'places', 'duration', 'movingTime', 'pace', 'elevationGain', 'stops'].includes(i.key)),
        kicker: copy.routeReplay.kicker,
        isHero: plan.routeIsHero,
      },
    });
  }

  // 5. Hero Gallery
  pages.push({
    id: 'hero-gallery',
    type: 'hero_gallery',
    title: copy.heroGallery.title,
    subtitle: copy.heroGallery.subtitle,
    data: {
      media: curated.heroGallery,
      kicker: copy.heroGallery.kicker,
    },
  });

  // 6. Story Insights
  if (plan.includeInsights) {
    pages.push({
      id: 'story-insights',
      type: 'story_insights',
      title: copy.storyInsights.title,
      subtitle: copy.storyInsights.subtitle,
      data: {
        insights,
        insightPhotos: curated.insightPhotos,
        kicker: copy.storyInsights.kicker,
      },
    });
  }

  // 7. Friend Captions
  if (plan.includeCaptions) {
    pages.push({
      id: 'friend-captions',
      type: 'friend_captions',
      title: copy.friendCaptions.title,
      subtitle: copy.friendCaptions.subtitle,
      data: {
        captions: curateCaptions(input.captions, plan.captionCount),
        kicker: copy.friendCaptions.kicker,
      },
    });
  }

  // 8. Share Page
  pages.push({
    id: 'share',
    type: 'share',
    title: copy.share.title,
    subtitle: copy.share.subtitle,
    data: {
      shareCardVertical: copy.shareCardVertical,
      shareCardSquare: copy.shareCardSquare,
      exportFormats: ['Private link', 'Vertical story card', 'Square recap card', 'Save as image'],
      coverPhoto: curated.coverPhoto,
      qualityScore: null, // will be filled after scoring
      kicker: copy.share.kicker,
    },
  });

  return pages;
}

// ─── Caption Curation ──────────────────────────────────────────

/**
 * Curate captions: pick the best ones, limit to 8-12.
 * Prioritize shorter, punchier captions.
 */
function curateCaptions(
  captions: { id: string; userId?: string; name: string; text: string; mediaId?: string; createdAt: string }[],
  limit = 12,
): { name: string; text: string; mediaId?: string }[] {
  if (captions.length === 0) return [];

  // Sort by: shortest first (punchier), but keep variety of authors
  const sorted = [...captions]
    .filter((c) => c.text.trim().length > 0)
    .sort((a, b) => {
      // Prefer captions between 10-100 chars
      const aScore = captionQualityScore(a.text);
      const bScore = captionQualityScore(b.text);
      return bScore - aScore;
    });

  // Limit to 12, ensure unique authors where possible
  const result: { name: string; text: string; mediaId?: string }[] = [];
  const seenAuthors = new Set<string>();

  for (const caption of sorted) {
    if (result.length >= limit) break;
    if (seenAuthors.has(caption.name) && result.length > 4) continue;
    result.push({ name: caption.name, text: caption.text, mediaId: caption.mediaId });
    seenAuthors.add(caption.name);
  }

  // If we didn't get enough from unique authors, add more
  for (const caption of sorted) {
    if (result.length >= Math.min(8, limit)) break;
    if (result.some((r) => r.text === caption.text)) continue;
    result.push({ name: caption.name, text: caption.text, mediaId: caption.mediaId });
  }

  return result;
}

function captionQualityScore(text: string): number {
  const len = text.trim().length;
  if (len < 5) return 1;
  if (len > 200) return 5;
  // Sweet spot: 10-100 chars
  if (len >= 10 && len <= 100) return 10;
  if (len >= 5 && len <= 150) return 7;
  return 3;
}

// ─── Key Stat for Share Card ───────────────────────────────────

function buildKeyStat(input: EngineInput, insights: GeneratedInsight[]): string {
  if (input.event.type === 'road_trip') {
    const distance = insights.find((i) => i.key === 'distance');
    if (distance) return distance.value;
  }
  const moments = insights.find((i) => i.key === 'moments');
  if (moments) return `${moments.value} moments`;
  return 'A story worth sharing';
}