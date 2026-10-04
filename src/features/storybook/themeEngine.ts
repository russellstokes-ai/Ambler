import { EventTypeKey, ThemeKey, getRecommendedThemes } from '../events/eventTypes';

export type StorybookThemeConfig = {
  theme: ThemeKey;
  layoutDensity: 'minimal' | 'balanced' | 'rich';
  motion: 'soft' | 'cinematic' | 'playful' | 'fast' | 'editorial';
  routeEmphasis: 'none' | 'light' | 'hero';
  captionTone: 'emotional' | 'funny' | 'premium' | 'keepsake' | 'editorial';
  insightStyle: 'subtle' | 'bold' | 'wrapped' | 'map_stats';
};

export function selectDefaultTheme(eventType: EventTypeKey): ThemeKey {
  return getRecommendedThemes(eventType)[0] ?? 'cinematic';
}

export function getThemeConfig(theme: ThemeKey): StorybookThemeConfig {
  switch (theme) {
    case 'route_replay':
      return { theme, layoutDensity: 'rich', motion: 'fast', routeEmphasis: 'hero', captionTone: 'editorial', insightStyle: 'map_stats' };
    case 'wrapped':
      return { theme, layoutDensity: 'rich', motion: 'playful', routeEmphasis: 'light', captionTone: 'funny', insightStyle: 'wrapped' };
    case 'luxe':
      return { theme, layoutDensity: 'minimal', motion: 'soft', routeEmphasis: 'light', captionTone: 'premium', insightStyle: 'subtle' };
    case 'confetti':
      return { theme, layoutDensity: 'rich', motion: 'playful', routeEmphasis: 'light', captionTone: 'funny', insightStyle: 'bold' };
    case 'neon_pulse':
      return { theme, layoutDensity: 'rich', motion: 'fast', routeEmphasis: 'light', captionTone: 'funny', insightStyle: 'wrapped' };
    case 'warm_gold':
      return { theme, layoutDensity: 'balanced', motion: 'soft', routeEmphasis: 'light', captionTone: 'emotional', insightStyle: 'subtle' };
    case 'retro_film':
      return { theme, layoutDensity: 'balanced', motion: 'soft', routeEmphasis: 'light', captionTone: 'emotional', insightStyle: 'subtle' };
    case 'magazine':
      return { theme, layoutDensity: 'rich', motion: 'editorial', routeEmphasis: 'light', captionTone: 'editorial', insightStyle: 'bold' };
    case 'chaos':
      return { theme, layoutDensity: 'rich', motion: 'fast', routeEmphasis: 'light', captionTone: 'funny', insightStyle: 'wrapped' };
    case 'family_keepsake':
      return { theme, layoutDensity: 'balanced', motion: 'soft', routeEmphasis: 'none', captionTone: 'keepsake', insightStyle: 'subtle' };
    case 'minimal':
      return { theme, layoutDensity: 'minimal', motion: 'soft', routeEmphasis: 'light', captionTone: 'premium', insightStyle: 'subtle' };
    case 'social_story':
      return { theme, layoutDensity: 'rich', motion: 'playful', routeEmphasis: 'light', captionTone: 'funny', insightStyle: 'bold' };
    case 'cinematic':
    default:
      return { theme, layoutDensity: 'balanced', motion: 'cinematic', routeEmphasis: 'light', captionTone: 'emotional', insightStyle: 'bold' };
  }
}
