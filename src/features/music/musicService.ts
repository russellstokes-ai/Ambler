import { Audio, AVPlaybackStatus } from 'expo-av';
import { ThemeKey, MusicCategory, MusicTrack, MusicSelection, EventType } from '../../types';

// Production builds intentionally ship with no bundled soundtrack until every
// audio asset has explicit commercial clearance. Add cleared asset modules here
// when the licensing manifest marks them productionReady=true.
const MUSIC_SOURCES: Record<string, number> = {};

// ─── Music Library ────────────────────────────────────────────

const MUSIC_LIBRARY: MusicTrack[] = [
  // Cinematic
  { id: 'cinematic-1', trackName: 'Swelling Dawn', category: 'cinematic', durationSeconds: 180, bpm: 72, energyLevel: 'low', emotionalArc: 'building', filePath: 'music/cinematic/swelling-dawn.mp3' },
  { id: 'cinematic-2', trackName: 'Slow Motion Memory', category: 'cinematic', durationSeconds: 200, bpm: 65, energyLevel: 'low', emotionalArc: 'winding', filePath: 'music/cinematic/slow-motion-memory.mp3' },
  { id: 'cinematic-3', trackName: 'Epic Crescendo', category: 'cinematic', durationSeconds: 240, bpm: 90, energyLevel: 'high', emotionalArc: 'peaking', filePath: 'music/cinematic/epic-crescendo.mp3' },

  // Upbeat
  { id: 'upbeat-1', trackName: 'Friday Feeling', category: 'upbeat', durationSeconds: 180, bpm: 120, energyLevel: 'high', emotionalArc: 'peaking', filePath: 'music/upbeat/friday-feeling.mp3' },
  { id: 'upbeat-2', trackName: 'Festival Anthem', category: 'upbeat', durationSeconds: 200, bpm: 128, energyLevel: 'high', emotionalArc: 'steady', filePath: 'music/upbeat/festival-anthem.mp3' },
  { id: 'upbeat-3', trackName: 'Good Times Only', category: 'upbeat', durationSeconds: 175, bpm: 115, energyLevel: 'high', emotionalArc: 'peaking', filePath: 'music/upbeat/good-times-only.mp3' },

  // Chilled
  { id: 'chilled-1', trackName: 'Golden Hour', category: 'chilled', durationSeconds: 210, bpm: 80, energyLevel: 'low', emotionalArc: 'steady', filePath: 'music/chilled/golden-hour.mp3' },
  { id: 'chilled-2', trackName: 'Late Night Drive', category: 'chilled', durationSeconds: 220, bpm: 75, energyLevel: 'low', emotionalArc: 'winding', filePath: 'music/chilled/late-night-drive.mp3' },

  // Luxe
  { id: 'luxe-1', trackName: 'String Quartet', category: 'luxe', durationSeconds: 240, bpm: 68, energyLevel: 'low', emotionalArc: 'steady', filePath: 'music/luxe/string-quartet.mp3' },
  { id: 'luxe-2', trackName: 'Piano Nocturne', category: 'luxe', durationSeconds: 220, bpm: 60, energyLevel: 'low', emotionalArc: 'winding', filePath: 'music/luxe/piano-nocturne.mp3' },

  // Retro
  { id: 'retro-1', trackName: '80s Synth Dream', category: 'retro', durationSeconds: 210, bpm: 95, energyLevel: 'medium', emotionalArc: 'building', filePath: 'music/retro/80s-synth-dream.mp3' },
  { id: 'retro-2', trackName: 'Disposable Camera', category: 'retro', durationSeconds: 190, bpm: 82, energyLevel: 'medium', emotionalArc: 'steady', filePath: 'music/retro/disposable-camera.mp3' },

  // Playful
  { id: 'playful-1', trackName: 'Chaos Mode', category: 'playful', durationSeconds: 170, bpm: 140, energyLevel: 'high', emotionalArc: 'peaking', filePath: 'music/playful/chaos-mode.mp3' },
  { id: 'playful-3', trackName: 'Social Story Pop', category: 'playful', durationSeconds: 175, bpm: 118, energyLevel: 'medium', emotionalArc: 'building', filePath: 'music/playful/social-story-pop.mp3' },

  // Sentimental
  { id: 'sentimental-1', trackName: 'Family Keepsake', category: 'sentimental', durationSeconds: 230, bpm: 68, energyLevel: 'low', emotionalArc: 'building', filePath: 'music/sentimental/family-keepsake.mp3' },
];

// ─── Theme → Category Mapping ─────────────────────────────────

const THEME_CATEGORY_MAP: Record<ThemeKey, MusicCategory[]> = {
  cinematic: ['cinematic'],
  social_story: ['playful', 'upbeat'],
  wrapped: ['playful', 'upbeat'],
  route_replay: ['cinematic', 'chilled'],
  luxe: ['luxe'],
  confetti: ['upbeat', 'playful'],
  neon_pulse: ['upbeat', 'playful'],
  warm_gold: ['chilled', 'upbeat'],
  retro_film: ['retro'],
  magazine: ['chilled', 'luxe'],
  chaos: ['playful'],
  family_keepsake: ['sentimental'],
  minimal: ['chilled'],
};

// ─── Event Type → Category Refinement ─────────────────────────

const EVENT_TYPE_CATEGORY_PREF: Partial<Record<EventType, MusicCategory[]>> = {
  wedding: ['sentimental', 'luxe'],
  festival: ['upbeat', 'playful'],
  road_trip: ['cinematic', 'chilled'],
  night_out: ['playful', 'upbeat'],
  birthday: ['upbeat', 'playful'],
  family_gathering: ['sentimental'],
  graduation: ['cinematic', 'upbeat'],
  hiking_day: ['cinematic', 'chilled'],
  backpacking_trip: ['cinematic', 'chilled'],
  camping_trip: ['cinematic', 'chilled'],
  ski_trip: ['upbeat', 'cinematic'],
  cruise: ['cinematic', 'luxe'],
  sports_trip: ['upbeat', 'playful'],
  match_day: ['upbeat', 'playful'],
  sports_event: ['upbeat', 'playful'],
  group_workout: ['upbeat', 'playful'],
  run_walk: ['upbeat', 'cinematic'],
  cycle_ride: ['upbeat', 'cinematic'],
  fitness_challenge: ['upbeat', 'cinematic'],
  theme_park_day: ['playful', 'upbeat'],
};

// ─── Music Service ────────────────────────────────────────────

class MusicService {
  private sound: Audio.Sound | null = null;
  private currentTrack: MusicTrack | null = null;
  private baseVolume = 1.0;
  private isMuted = false;
  private isDucked = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  /**
   * Select a music track based on theme and event type.
   */
  selectTrack(theme: ThemeKey, eventType?: EventType, mediaCount = 0): MusicSelection {
    const themeCategories = THEME_CATEGORY_MAP[theme] ?? ['cinematic'];
    const eventPrefs = eventType ? EVENT_TYPE_CATEGORY_PREF[eventType] : null;

    // Combine theme categories with event preferences (event prefs take priority)
    let candidateCategories: MusicCategory[];
    if (eventPrefs) {
      // Intersect: prefer categories that are in both lists, fall back to event prefs
      const intersect = eventPrefs.filter(c => themeCategories.includes(c));
      candidateCategories = intersect.length > 0 ? intersect : [...eventPrefs, ...themeCategories];
    } else {
      candidateCategories = themeCategories;
    }

    // Event energy: high photo density → high energy
    const energyLevel = mediaCount > 50 ? 'high' : mediaCount > 20 ? 'medium' : 'low';

    // Find best matching track
    let candidates = MUSIC_LIBRARY.filter(t => candidateCategories.includes(t.category));

    if (candidates.length === 0) {
      candidates = MUSIC_LIBRARY.filter(t => t.category === 'cinematic');
    }

    // Prefer matching energy level
    const energyMatch = candidates.filter(t => t.energyLevel === energyLevel);
    if (energyMatch.length > 0) {
      candidates = energyMatch;
    }

    const track = candidates[Math.floor(Math.random() * candidates.length)];

    return {
      trackId: track.id,
      trackName: track.trackName,
      category: track.category,
      durationSeconds: track.durationSeconds,
      bpm: track.bpm,
      energyLevel: track.energyLevel,
      emotionalArc: track.emotionalArc,
    };
  }

  /** Available *playable* bundled tracks for the story editor. */
  getAvailableTracks(): MusicTrack[] {
    return MUSIC_LIBRARY
      .filter((track) => Boolean(MUSIC_SOURCES[track.filePath]))
      .map((track) => ({ ...track }));
  }

  /** Whether the selected soundtrack has a cleared, bundled audio source. */
  hasPlaybackForSelection(selection?: Pick<MusicSelection, 'trackId'> | null): boolean {
    if (!selection) return false;
    const track = MUSIC_LIBRARY.find((item) => item.id === selection.trackId);
    return Boolean(track && MUSIC_SOURCES[track.filePath]);
  }

  /** Build a playback selection from a known library track. */
  selectionForTrack(trackId: string): MusicSelection | null {
    const track = MUSIC_LIBRARY.find((item) => item.id === trackId);
    if (!track || !MUSIC_SOURCES[track.filePath]) return null;
    return {
      trackId: track.id,
      trackName: track.trackName,
      category: track.category,
      durationSeconds: track.durationSeconds,
      bpm: track.bpm,
      energyLevel: track.energyLevel,
      emotionalArc: track.emotionalArc,
    };
  }

  /**
   * Preload and prepare the audio track.
   */
  async preload(selection: MusicSelection): Promise<void> {
    try {
      // Unload previous track
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const track = MUSIC_LIBRARY.find(t => t.id === selection.trackId);
      if (!track) {
        console.warn('[MusicService] Track not found:', selection.trackId);
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const source = MUSIC_SOURCES[track.filePath];
      if (!source) {
        console.warn('[MusicService] Audio file not bundled:', track.filePath);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: false, isLooping: true, volume: this.getEffectiveVolume() },
      );
      this.sound = sound;
      this.currentTrack = track;
      this.isInitialized = true;
    } catch (error) {
      console.warn('[MusicService] Preload error:', error);
    }
  }

  /**
   * Start playback.
   */
  async play(): Promise<void> {
    if (!this.sound || this.isMuted) return;
    try {
      await this.sound.setVolumeAsync(this.baseVolume);
      await this.sound.playAsync();
    } catch (error) {
      console.warn('[MusicService] Play error:', error);
    }
  }

  /**
   * Pause playback.
   */
  async pause(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
    } catch (error) {
      console.warn('[MusicService] Pause error:', error);
    }
  }

  /**
   * Stop and reset playback.
   */
  async stop(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
    } catch (error) {
      console.warn('[MusicService] Stop error:', error);
    }
  }

  /**
   * Mute/unmute toggle.
   */
  async toggleMute(): Promise<boolean> {
    this.isMuted = !this.isMuted;
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.isMuted ? 0 : this.getEffectiveVolume());
      } catch (error) {
        console.warn('[MusicService] Mute error:', error);
      }
    }
    return this.isMuted;
  }

  /**
   * Duck volume (reduce) — used when video plays within storybook.
   */
  async duckVolume(): Promise<void> {
    this.isDucked = true;
    if (this.sound && !this.isMuted) {
      try {
        await this.sound.setVolumeAsync(this.baseVolume * 0.2);
      } catch (error) {
        console.warn('[MusicService] Duck error:', error);
      }
    }
  }

  /**
   * Restore volume after ducking.
   */
  async restoreVolume(): Promise<void> {
    this.isDucked = false;
    if (this.sound && !this.isMuted) {
      try {
        await this.sound.setVolumeAsync(this.baseVolume);
      } catch (error) {
        console.warn('[MusicService] Restore error:', error);
      }
    }
  }

  /**
   * Fade out gradually over durationMs.
   */
  async fadeOut(durationMs = 2000): Promise<void> {
    if (!this.sound) return;

    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = this.baseVolume / steps;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    let currentStep = 0;
    return new Promise((resolve) => {
      this.fadeInterval = setInterval(async () => {
        currentStep++;
        const newVol = Math.max(0, this.baseVolume - volumeStep * currentStep);

        if (this.sound) {
          try {
            await this.sound.setVolumeAsync(newVol);
          } catch {
            // ignore
          }
        }

        if (currentStep >= steps) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          await this.pause();
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Fade in gradually over durationMs.
   */
  async fadeIn(durationMs = 1500): Promise<void> {
    if (!this.sound || this.isMuted) return;

    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = this.baseVolume / steps;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    let currentStep = 0;
    await this.sound.setVolumeAsync(0);
    await this.play();

    return new Promise((resolve) => {
      this.fadeInterval = setInterval(async () => {
        currentStep++;
        const newVol = Math.min(this.baseVolume, volumeStep * currentStep);

        if (this.sound) {
          try {
            await this.sound.setVolumeAsync(newVol);
          } catch {
            // ignore
          }
        }

        if (currentStep >= steps) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Clean up — unload audio and release resources.
   */
  async cleanup(): Promise<void> {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.warn('[MusicService] Cleanup error:', error);
      }
    }
    this.currentTrack = null;
    this.isInitialized = false;
  }

  /**
   * Get the effective volume based on mute/duck state.
   */
  private getEffectiveVolume(): number {
    if (this.isMuted) return 0;
    if (this.isDucked) return this.baseVolume * 0.2;
    return this.baseVolume;
  }

  /**
   * Get current track info.
   */
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  /**
   * Check if music is currently playing.
   */
  isPlaying(): boolean {
    return this.isInitialized && !this.isMuted;
  }
}

// Export singleton instance
export const musicService = new MusicService();

// Export the class for testing
export { MusicService };

// Export the library for inspection
export { MUSIC_LIBRARY };
