export type AuthProvider = 'google' | 'facebook' | 'apple';

// ─── Motion Profile Types ─────────────────────────────────────

export type MotionPreset = 'soft' | 'cinematic' | 'playful' | 'fast' | 'editorial';

export type PageTransitionType = 'slide' | 'fade' | 'scale' | 'parallax' | 'cross_dissolve';

export type StaggerDirection = 'up' | 'down' | 'left' | 'right' | 'scale';

export type HeroEffectType = 'ken_burns' | 'parallax' | 'zoom' | 'shake' | 'none';

export type StatAnimationType = 'count_up' | 'slide_in' | 'pop' | 'none';

export type RouteAnimationType = 'draw_line' | 'drop_pins' | 'fly_to' | 'none';

export type HapticsIntensity = 'light' | 'medium' | 'heavy';

export interface MotionProfile {
  pageTransition: {
    durationMs: number;
    easing: string;
    type: PageTransitionType;
  };
  elementStagger: {
    delayMs: number;
    durationMs: number;
    direction: StaggerDirection;
  };
  heroEffect: {
    type: HeroEffectType;
    durationMs: number;
    intensity: number;
  };
  statAnimation: {
    type: StatAnimationType;
    durationMs: number;
  };
  routeAnimation: {
    type: RouteAnimationType;
    durationMs: number;
  };
  haptics: {
    enabled: boolean;
    intensity: HapticsIntensity;
    patterns: string[];
  };
}

// ─── Theme Preset Types ───────────────────────────────────────

export interface ThemePreset {
  theme: ThemeKey;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    overlay: string;
  };
  typography: {
    titleSize: number;
    titleWeight: '400' | '500' | '600' | '700' | '800' | '900';
    titleLetterSpacing: number;
    subtitleSize: number;
    bodySize: number;
    bodyWeight: '400' | '500' | '600' | '700' | '800' | '900';
    titleTransform: 'none' | 'uppercase';
    captionLetterSpacing: number;
  };
  motion: MotionPreset;
  motionTiming: {
    pageTransitionMs: number;
    elementMs: number;
    staggerMs: number;
    heroMs: number;
  };
  card: {
    borderRadius: number;
    shadowOpacity: number;
    shadowRadius: number;
    borderWidth: number;
    borderColor: string;
    backgroundOpacity: number;
  };
  mapStyle: 'dark' | 'light' | 'standard' | 'satellite';
  mapPalette: {
    route: string;
    routeShadow: string;
    pin: string;
    land: string;
    water: string;
    road: string;
    label: string;
  };
  insightStyle: 'subtle' | 'bold' | 'wrapped' | 'map_stats';
  overlayGradient: {
    colors: [string, string, string];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  preview: {
    layout: 'full_bleed' | 'vertical_card' | 'stat_cards' | 'map_first' | 'editorial' | 'film_strip' | 'collage' | 'scrapbook' | 'minimal_grid';
    motif: 'film' | 'stickers' | 'stats' | 'route' | 'gold' | 'grain' | 'columns' | 'neon' | 'keepsake' | 'whitespace';
  };
}

// ─── Music Types ──────────────────────────────────────────────

export type MusicCategory =
  | 'cinematic'
  | 'upbeat'
  | 'chilled'
  | 'luxe'
  | 'retro'
  | 'playful'
  | 'sentimental';

export type MusicEnergyLevel = 'low' | 'medium' | 'high';

export type MusicEmotionalArc = 'building' | 'steady' | 'peaking' | 'winding';

export interface MusicTrack {
  id: string;
  trackName: string;
  category: MusicCategory;
  durationSeconds: number;
  bpm: number;
  energyLevel: MusicEnergyLevel;
  emotionalArc: MusicEmotionalArc;
  filePath: string;
}

export interface MusicSelection {
  trackId: string;
  trackName: string;
  category: MusicCategory;
  durationSeconds: number;
  bpm: number;
  energyLevel: MusicEnergyLevel;
  emotionalArc: MusicEmotionalArc;
}

// ─── Theme Key (re-exported for convenience) ──────────────────

export type ThemeKey =
  | 'cinematic'
  | 'social_story'
  | 'wrapped'
  | 'route_replay'
  | 'luxe'
  | 'confetti'
  | 'neon_pulse'
  | 'warm_gold'
  | 'retro_film'
  | 'magazine'
  | 'chaos'
  | 'family_keepsake'
  | 'minimal';

export type EventType = import('../features/events/eventTypes').EventTypeKey;

export type StorybookPageType =
  | 'cover'
  | 'cinematic_opening'
  | 'timeline'
  | 'route_replay'
  | 'hero_gallery'
  | 'story_insights'
  | 'friend_captions'
  | 'share';

export type StorybookQualityScore = {
  visualImpact: number;
  narrativeFlow: number;
  photoDiversity: number;
  timelineCompleteness: number;
  routeCompleteness: number;
  shareability: number;
};

export type VibeEvent = {
  id: string;
  title: string;
  type: EventType;
  locationLabel: string;
  startsAt: string;
  endsAt?: string;
  coverUrl?: string;
  selectedTheme?: string;
};

export type StoryInsight = {
  key: string;
  label: string;
  value: string;
  tone?: 'fun' | 'premium' | 'stat' | 'memory';
};

export type StorybookPage = {
  id: string;
  type: StorybookPageType;
  title: string;
  subtitle?: string;
  data: Record<string, unknown>;
};

export type Storybook = {
  id: string;
  eventId: string;
  title: string;
  qualityScore: StorybookQualityScore;
  pages: StorybookPage[];
  musicSelection?: MusicSelection;
};
