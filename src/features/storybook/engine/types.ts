// Storybook Engine — Core Types
// All pipeline input/output types for the storybook generation engine.

import {
  EventType,
  MusicEmotionalArc,
  MusicEnergyLevel,
  MusicSelection,
  StorybookPage,
  StorybookQualityScore,
  ThemeKey,
} from '../../../types';
export type { EventType, MusicSelection, ThemeKey };

// ─── Input Types ───────────────────────────────────────────────

export interface EngineMediaItem {
  id: string;
  uri: string;
  storagePath?: string;
  thumbnailUri?: string;
  thumbnailPath?: string;
  capturedAt: string;       // ISO timestamp
  uploaderName: string;
  uploaderId?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;  // for video
  mediaType: 'photo' | 'video';
  reactions?: number;
  comments?: string[];
  sharpnessScore?: number;   // 0-100
  brightnessScore?: number;  // 0-100
  colorVibrancyScore?: number; // 0-100
  faceDetected?: boolean;
  isGroupShot?: boolean;
  gpsLat?: number;
  gpsLng?: number;
  placeLabel?: string;
}

export interface EngineLocationPoint {
  latitude: number;
  longitude: number;
  capturedAt: string;       // ISO timestamp
  placeLabel?: string;
  accuracyM?: number;
  altitudeM?: number;
  speedMps?: number;
}

export interface EngineCaption {
  id: string;
  userId?: string;
  name: string;
  text: string;
  mediaId?: string;
  createdAt: string;
}

export interface EngineEvent {
  id: string;
  title: string;
  type: EventType;
  startsAt: string;
  endsAt?: string;
  locationLabel: string;
  coverUrl?: string;
}

export interface PrivacySettings {
  blurPrivateLocations: boolean;
  shareSafeMode: boolean;
}

export type StoryLength = 'short' | 'standard' | 'epic';

export interface EngineInput {
  event: EngineEvent;
  media: EngineMediaItem[];
  locations: EngineLocationPoint[];
  captions: EngineCaption[];
  theme: ThemeKey;
  privacySettings: PrivacySettings;
  storyLength?: StoryLength;
}

// ─── Media Score ───────────────────────────────────────────────

export interface MediaScore {
  mediaId: string;
  sharpness: number;         // 0-100
  brightness: number;        // 0-100
  vibrancy: number;          // 0-100
  socialScore: number;       // 0-100
  compositionScore: number;  // 0-100
  temporalScore: number;     // 0-100
  overall: number;           // weighted combination 0-100
}

export interface ScoredMediaItem extends EngineMediaItem {
  score: MediaScore;
}

// ─── Timeline ──────────────────────────────────────────────────

export interface TimelineChapter {
  id: string;
  title: string;
  timeRange: string;        // "6:00 PM - 8:30 PM"
  startTime: string;
  endTime: string;
  mediaCount: number;
  highlights: ScoredMediaItem[];
  density: 'sparse' | 'moderate' | 'dense';
}

// ─── Route ─────────────────────────────────────────────────────

export interface RoutePoint {
  lat: number;
  lng: number;
  capturedAt: string;
}

export interface RouteStop {
  id: string;
  lat: number;
  lng: number;
  placeLabel?: string;
  durationMin: number;
  bestPhoto?: ScoredMediaItem;
  arrivalTime: string;
  departureTime: string;
}

export interface ProcessedRoute {
  points: RoutePoint[];
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDurationHours: number;
  movingDurationHours: number;
  averageMovingKph: number;
  maxSpeedKph?: number;
  elevationGainM?: number;
  elevationLossM?: number;
  highestElevationM?: number;
  lowestElevationM?: number;
  summit?: { lat: number; lng: number; altitudeM: number; capturedAt: string; placeLabel?: string };
  placesVisited: string[];
  blurredPoints: RoutePoint[];
  hasRoute: boolean;
}

// ─── Curated Content ───────────────────────────────────────────

export interface CuratedContent {
  coverPhoto: ScoredMediaItem | null;
  openingSequence: ScoredMediaItem[];
  heroGallery: ScoredMediaItem[];
  timelineHighlights: { chapterId: string; photos: ScoredMediaItem[] }[];
  routePhotos: { stopId: string; photo: ScoredMediaItem }[];
  insightPhotos: {
    peakMoment: ScoredMediaItem | null;
    topContributor: ScoredMediaItem | null;
    bestGroupShot: ScoredMediaItem | null;
  };
}

// ─── Insights ──────────────────────────────────────────────────

export type InsightTone = 'stat' | 'fun' | 'premium' | 'memory';

export interface GeneratedInsight {
  key: string;
  label: string;
  value: string;
  tone: InsightTone;
  emoji?: string;
}

// ─── Copy ──────────────────────────────────────────────────────

export interface PageCopy {
  kicker?: string;
  title: string;
  subtitle?: string;
}

export interface StorybookCopy {
  cover: PageCopy;
  opening: PageCopy;
  timeline: PageCopy;
  routeReplay: PageCopy;
  heroGallery: PageCopy;
  storyInsights: PageCopy;
  friendCaptions: PageCopy;
  share: PageCopy;
  shareCardVertical: string;
  shareCardSquare: string;
}

// ─── Quality Score ─────────────────────────────────────────────

export type StorybookStatus = 'needs_more_content' | 'good_with_suggestions' | 'ready';

export interface QualityScore {
  visualImpact: number;
  narrativeFlow: number;
  photoDiversity: number;
  timelineCompleteness: number;
  routeCompleteness: number;
  shareability: number;
  overall: number;
  status: StorybookStatus;
}

// ─── Music Selection ───────────────────────────────────────────

export type EnergyLevel = MusicEnergyLevel;
export type EmotionalArc = MusicEmotionalArc;

// ─── Theme Config (extended for engine) ────────────────────────

export interface EngineThemeConfig {
  theme: ThemeKey;
  layoutDensity: 'minimal' | 'balanced' | 'rich';
  motion: 'soft' | 'cinematic' | 'playful' | 'fast' | 'editorial';
  routeEmphasis: 'none' | 'light' | 'hero';
  captionTone: 'emotional' | 'funny' | 'premium' | 'keepsake' | 'editorial';
  insightStyle: 'subtle' | 'bold' | 'wrapped' | 'map_stats';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    overlay: string;
  };
  typography: {
    headingFamily: string;
    bodyFamily: string;
    headingWeight: number;
    bodyWeight: number;
    headingSize: number;
    bodySize: number;
    letterSpacing: number;
  };
  mapStyle: 'dark' | 'light' | 'standard' | 'retro' | 'minimal';
  shareCardStyle: 'cinematic' | 'bold' | 'editorial' | 'minimal' | 'playful' | 'warm';
}

// ─── Generated Storybook ───────────────────────────────────────

export interface GeneratedStorybook {
  storybook: {
    id: string;
    eventId: string;
    title: string;
    qualityScore: StorybookQualityScore;
    pages: StorybookPage[];
    musicSelection?: MusicSelection;
  };
  status: StorybookStatus;
  suggestions: string[];
  insights: GeneratedInsight[];
  curated: CuratedContent;
  route: ProcessedRoute;
  chapters: TimelineChapter[];
}

// ─── Event Type Strategy Config ────────────────────────────────

export interface EventTypeConfig {
  phaseLabels?: string[];                    // ordered chapter names for event phases
  specificInsights?: string[];               // insight keys to generate
  vibeLabels?: string[];                     // possible topVibe values
  energyHint?: 'low' | 'medium' | 'high';    // default energy hint for music
}

export type EventTypeConfigMap = Record<string, EventTypeConfig>;