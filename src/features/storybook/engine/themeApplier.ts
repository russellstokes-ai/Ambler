// Theme Applier — Apply theme config to storybook pages
// Injects theme colors, typography, motion hints, layout density, and styles.

import { StorybookPage } from '../../../types';
import { ThemeKey } from '../../../types';
import { EngineThemeConfig, ScoredMediaItem, ProcessedRoute, GeneratedInsight, TimelineChapter, CuratedContent, StorybookCopy } from './types';

/**
 * Get the full engine theme config for a theme key.
 * Includes colors, typography, map style, and share card style.
 */
export function getEngineThemeConfig(theme: ThemeKey): EngineThemeConfig {
  const base = getBaseThemeConfig(theme);
  return { ...base, ...getThemeVisuals(theme) };
}

/**
 * Apply theme to all storybook pages.
 * Injects theme-specific styling data into each page.
 */
export function applyTheme(
  pages: StorybookPage[],
  themeConfig: EngineThemeConfig,
): StorybookPage[] {
  return pages.map((page) => ({
    ...page,
    data: {
      ...page.data,
      themeConfig: {
        layoutDensity: themeConfig.layoutDensity,
        motion: themeConfig.motion,
        colorPalette: themeConfig.colorPalette,
        typography: themeConfig.typography,
        mapStyle: themeConfig.mapStyle,
        insightStyle: themeConfig.insightStyle,
        shareCardStyle: themeConfig.shareCardStyle,
      },
      // Page-specific animation hints
      animationHints: getAnimationHints(page.type, themeConfig),
    },
  }));
}

// ─── Base Theme Configs ────────────────────────────────────────

function getBaseThemeConfig(theme: ThemeKey): Omit<EngineThemeConfig, 'colorPalette' | 'typography' | 'mapStyle' | 'shareCardStyle'> {
  switch (theme) {
    case 'route_replay':
      return {
        theme,
        layoutDensity: 'rich',
        motion: 'fast',
        routeEmphasis: 'hero',
        captionTone: 'editorial',
        insightStyle: 'map_stats',
      };
    case 'wrapped':
      return {
        theme,
        layoutDensity: 'rich',
        motion: 'playful',
        routeEmphasis: 'light',
        captionTone: 'funny',
        insightStyle: 'wrapped',
      };
    case 'luxe':
      return {
        theme,
        layoutDensity: 'minimal',
        motion: 'soft',
        routeEmphasis: 'light',
        captionTone: 'premium',
        insightStyle: 'subtle',
      };
    case 'retro_film':
      return {
        theme,
        layoutDensity: 'balanced',
        motion: 'soft',
        routeEmphasis: 'light',
        captionTone: 'emotional',
        insightStyle: 'subtle',
      };
    case 'magazine':
      return {
        theme,
        layoutDensity: 'rich',
        motion: 'editorial',
        routeEmphasis: 'light',
        captionTone: 'editorial',
        insightStyle: 'bold',
      };
    case 'chaos':
      return {
        theme,
        layoutDensity: 'rich',
        motion: 'fast',
        routeEmphasis: 'light',
        captionTone: 'funny',
        insightStyle: 'wrapped',
      };
    case 'family_keepsake':
      return {
        theme,
        layoutDensity: 'balanced',
        motion: 'soft',
        routeEmphasis: 'none',
        captionTone: 'keepsake',
        insightStyle: 'subtle',
      };
    case 'minimal':
      return {
        theme,
        layoutDensity: 'minimal',
        motion: 'soft',
        routeEmphasis: 'light',
        captionTone: 'premium',
        insightStyle: 'subtle',
      };
    case 'social_story':
      return {
        theme,
        layoutDensity: 'rich',
        motion: 'playful',
        routeEmphasis: 'light',
        captionTone: 'funny',
        insightStyle: 'bold',
      };
    case 'cinematic':
    default:
      return {
        theme,
        layoutDensity: 'balanced',
        motion: 'cinematic',
        routeEmphasis: 'light',
        captionTone: 'emotional',
        insightStyle: 'bold',
      };
  }
}

// ─── Theme Visuals ─────────────────────────────────────────────

function getThemeVisuals(theme: ThemeKey): Pick<EngineThemeConfig, 'colorPalette' | 'typography' | 'mapStyle' | 'shareCardStyle'> {
  switch (theme) {
    case 'cinematic':
      return {
        colorPalette: {
          primary: '#0A0A0A',
          secondary: '#1A1A2E',
          accent: '#E94560',
          background: '#000000',
          surface: '#111118',
          textPrimary: '#FFFFFF',
          textSecondary: '#A0A0B0',
          overlay: 'rgba(0, 0, 0, 0.6)',
        },
        typography: {
          headingFamily: 'serif',
          bodyFamily: 'system',
          headingWeight: 700,
          bodyWeight: 400,
          headingSize: 28,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'dark',
        shareCardStyle: 'cinematic',
      };
    case 'social_story':
      return {
        colorPalette: {
          primary: '#6C5CE7',
          secondary: '#00CEC9',
          accent: '#FD79A8',
          background: '#FFFFFF',
          surface: '#F8F9FA',
          textPrimary: '#2D3436',
          textSecondary: '#636E72',
          overlay: 'rgba(255, 255, 255, 0.85)',
        },
        typography: {
          headingFamily: 'system',
          bodyFamily: 'system',
          headingWeight: 800,
          bodyWeight: 400,
          headingSize: 24,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'standard',
        shareCardStyle: 'playful',
      };
    case 'wrapped':
      return {
        colorPalette: {
          primary: '#1DB954',
          secondary: '#191414',
          accent: '#FFFFFF',
          background: '#0A0A0A',
          surface: '#1E1E1E',
          textPrimary: '#FFFFFF',
          textSecondary: '#B3B3B3',
          overlay: 'rgba(0, 0, 0, 0.7)',
        },
        typography: {
          headingFamily: 'system',
          bodyFamily: 'system',
          headingWeight: 800,
          bodyWeight: 500,
          headingSize: 32,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'dark',
        shareCardStyle: 'bold',
      };
    case 'route_replay':
      return {
        colorPalette: {
          primary: '#2563EB',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          background: '#0F172A',
          surface: '#1E293B',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          overlay: 'rgba(15, 23, 42, 0.7)',
        },
        typography: {
          headingFamily: 'system',
          bodyFamily: 'system',
          headingWeight: 700,
          bodyWeight: 400,
          headingSize: 26,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'standard',
        shareCardStyle: 'editorial',
      };
    case 'luxe':
      return {
        colorPalette: {
          primary: '#0D0D0D',
          secondary: '#1A1A1A',
          accent: '#D4AF37',
          background: '#0D0D0D',
          surface: '#1A1A1A',
          textPrimary: '#F5F5F5',
          textSecondary: '#A0A0A0',
          overlay: 'rgba(0, 0, 0, 0.75)',
        },
        typography: {
          headingFamily: 'serif',
          bodyFamily: 'serif',
          headingWeight: 600,
          bodyWeight: 400,
          headingSize: 26,
          bodySize: 15,
          letterSpacing: 0.5,
        },
        mapStyle: 'dark',
        shareCardStyle: 'minimal',
      };
    case 'retro_film':
      return {
        colorPalette: {
          primary: '#3E2723',
          secondary: '#5D4037',
          accent: '#FFB74D',
          background: '#1A1410',
          surface: '#2A2018',
          textPrimary: '#F5E6D3',
          textSecondary: '#A89080',
          overlay: 'rgba(42, 32, 24, 0.6)',
        },
        typography: {
          headingFamily: 'serif',
          bodyFamily: 'system',
          headingWeight: 700,
          bodyWeight: 400,
          headingSize: 26,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'retro',
        shareCardStyle: 'warm',
      };
    case 'magazine':
      return {
        colorPalette: {
          primary: '#1A1A1A',
          secondary: '#333333',
          accent: '#E63946',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          textPrimary: '#1A1A1A',
          textSecondary: '#666666',
          overlay: 'rgba(255, 255, 255, 0.85)',
        },
        typography: {
          headingFamily: 'serif',
          bodyFamily: 'system',
          headingWeight: 700,
          bodyWeight: 400,
          headingSize: 30,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'light',
        shareCardStyle: 'editorial',
      };
    case 'chaos':
      return {
        colorPalette: {
          primary: '#FF006E',
          secondary: '#8338EC',
          accent: '#FFBE0B',
          background: '#0A0A0A',
          surface: '#1A0A1A',
          textPrimary: '#FFFFFF',
          textSecondary: '#C0C0C0',
          overlay: 'rgba(0, 0, 0, 0.6)',
        },
        typography: {
          headingFamily: 'system',
          bodyFamily: 'system',
          headingWeight: 900,
          bodyWeight: 500,
          headingSize: 28,
          bodySize: 17,
          letterSpacing: 0,
        },
        mapStyle: 'standard',
        shareCardStyle: 'playful',
      };
    case 'family_keepsake':
      return {
        colorPalette: {
          primary: '#4A3429',
          secondary: '#6B5D54',
          accent: '#D4A574',
          background: '#FAF6F0',
          surface: '#F0EBE3',
          textPrimary: '#3E2723',
          textSecondary: '#7D6E63',
          overlay: 'rgba(250, 246, 240, 0.85)',
        },
        typography: {
          headingFamily: 'serif',
          bodyFamily: 'system',
          headingWeight: 600,
          bodyWeight: 400,
          headingSize: 26,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'light',
        shareCardStyle: 'warm',
      };
    case 'minimal':
    default:
      return {
        colorPalette: {
          primary: '#000000',
          secondary: '#333333',
          accent: '#007AFF',
          background: '#FFFFFF',
          surface: '#F5F5F7',
          textPrimary: '#1D1D1F',
          textSecondary: '#86868B',
          overlay: 'rgba(255, 255, 255, 0.9)',
        },
        typography: {
          headingFamily: 'system',
          bodyFamily: 'system',
          headingWeight: 600,
          bodyWeight: 400,
          headingSize: 24,
          bodySize: 16,
          letterSpacing: 0,
        },
        mapStyle: 'minimal',
        shareCardStyle: 'minimal',
      };
  }
}

// ─── Animation Hints ───────────────────────────────────────────

interface AnimationHints {
  heroEffect: 'ken_burns' | 'parallax' | 'zoom' | 'none';
  heroDurationMs: number;
  staggerDelayMs: number;
  staggerDirection: 'up' | 'down' | 'left' | 'right' | 'scale';
  pageTransitionType: 'slide' | 'fade' | 'scale' | 'parallax' | 'cross_dissolve';
  pageTransitionMs: number;
  statAnimation: 'count_up' | 'slide_in' | 'pop' | 'none';
  statDurationMs: number;
  routeAnimation: 'draw_line' | 'drop_pins' | 'fly_to' | 'none';
  routeDurationMs: number;
}

function getAnimationHints(pageType: string, theme: EngineThemeConfig): AnimationHints {
  const base = getBaseAnimationHints(theme);

  switch (pageType) {
    case 'cover':
      return {
        ...base,
        heroEffect: base.heroEffect,
        heroDurationMs: base.heroDurationMs * 2, // slower for cover
      };
    case 'cinematic_opening':
      return {
        ...base,
        pageTransitionType: 'cross_dissolve',
        staggerDirection: 'scale',
      };
    case 'route_replay':
      return {
        ...base,
        routeAnimation: theme.routeEmphasis === 'hero' ? 'draw_line' : 'drop_pins',
        routeDurationMs: theme.routeEmphasis === 'hero' ? 2500 : 800,
      };
    case 'story_insights':
      return {
        ...base,
        statAnimation: theme.insightStyle === 'wrapped' ? 'pop' : 'count_up',
        statDurationMs: theme.insightStyle === 'wrapped' ? 400 : 800,
      };
    default:
      return base;
  }
}

function getBaseAnimationHints(theme: EngineThemeConfig): AnimationHints {
  const hints: AnimationHints = {
    heroEffect: 'ken_burns',
    heroDurationMs: 8000,
    staggerDelayMs: 100,
    staggerDirection: 'up',
    pageTransitionType: 'fade',
    pageTransitionMs: 500,
    statAnimation: 'count_up',
    statDurationMs: 800,
    routeAnimation: 'draw_line',
    routeDurationMs: 2000,
  };

  switch (theme.motion) {
    case 'cinematic':
      hints.pageTransitionType = 'cross_dissolve';
      hints.pageTransitionMs = 900;
      hints.staggerDelayMs = 120;
      hints.heroEffect = 'ken_burns';
      hints.heroDurationMs = 8000;
      break;
    case 'playful':
      hints.pageTransitionType = 'slide';
      hints.pageTransitionMs = 300;
      hints.staggerDelayMs = 60;
      hints.staggerDirection = 'scale';
      hints.heroEffect = 'parallax';
      hints.heroDurationMs = 4000;
      hints.statAnimation = 'pop';
      hints.statDurationMs = 400;
      break;
    case 'fast':
      hints.pageTransitionType = 'slide';
      hints.pageTransitionMs = 250;
      hints.staggerDelayMs = 50;
      hints.heroEffect = 'none';
      break;
    case 'soft':
      hints.pageTransitionType = 'fade';
      hints.pageTransitionMs = 700;
      hints.staggerDelayMs = 150;
      hints.heroEffect = 'ken_burns';
      hints.heroDurationMs = 10000;
      break;
    case 'editorial':
      hints.pageTransitionType = 'slide';
      hints.pageTransitionMs = 500;
      hints.staggerDelayMs = 120;
      hints.heroEffect = 'parallax';
      hints.heroDurationMs = 5000;
      break;
  }

  return hints;
}
