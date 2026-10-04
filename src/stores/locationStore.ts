import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationPoint, CaptureStatus } from '../features/location/locationTypes';
import {
  LocationCaptureSubscription,
  startCapture as startLocationCapture,
  stopCapture as stopLocationCapture,
  getRouteForEvent,
  calculateRouteDistance,
  calculateRouteDuration,
  countPlacesVisited,
  detectStops,
} from '../features/location/locationService';

interface LocationState {
  routeByEvent: Record<string, LocationPoint[]>;
  isCapturing: boolean;
  consentGiven: Record<string, boolean>;
  captureStatus: CaptureStatus;
  activeCaptureEventId: string | null;
  error: string | null;

  startCapture: (eventId: string) => Promise<void>;
  stopCapture: (eventId: string) => void;
  pauseCapture: () => void;
  resumeCapture: () => Promise<void>;
  addRoutePoint: (eventId: string, point: LocationPoint) => void;
  clearRoute: (eventId: string) => void;
  giveConsent: (eventId: string) => void;
  revokeConsent: (eventId: string) => void;
  loadStoredRoutes: (eventId?: string) => Promise<void>;
  persistRoutes: () => Promise<void>;

  _captureSubscription: LocationCaptureSubscription | null;
}

const CONSENT_STORAGE_KEY = 'ambler_location_consent';
const LEGACY_CONSENT_STORAGE_KEY = 'vibe_loop_location_consent';

export const useLocationStore = create<LocationState>((set, get) => ({
  routeByEvent: {},
  isCapturing: false,
  consentGiven: {},
  captureStatus: 'idle',
  activeCaptureEventId: null,
  error: null,
  _captureSubscription: null,

  startCapture: async (eventId: string) => {
    if (!get().consentGiven[eventId]) {
      set({ captureStatus: 'requesting_consent', error: 'Consent required before capturing' });
      return;
    }

    stopLocationCapture(get()._captureSubscription);

    set({
      isCapturing: true,
      captureStatus: 'capturing',
      activeCaptureEventId: eventId,
      error: null,
      _captureSubscription: null,
    });

    try {
      const subscription = await startLocationCapture(eventId, (point) => {
        get().addRoutePoint(eventId, point);
      });
      set({ _captureSubscription: subscription });
    } catch (error) {
      set({
        isCapturing: false,
        captureStatus: 'idle',
        activeCaptureEventId: null,
        error: error instanceof Error ? error.message : 'Could not start Route Replay',
      });
    }
  },

  stopCapture: (eventId: string) => {
    stopLocationCapture(get()._captureSubscription);

    set({
      isCapturing: false,
      captureStatus: 'stopped',
      activeCaptureEventId: eventId,
      _captureSubscription: null,
    });

    get().loadStoredRoutes(eventId).catch(() => {});
    get().persistRoutes();
  },

  pauseCapture: () => {
    stopLocationCapture(get()._captureSubscription);

    set({
      isCapturing: false,
      captureStatus: 'paused',
      _captureSubscription: null,
    });
  },

  resumeCapture: async () => {
    const eventId = get().activeCaptureEventId;
    if (!eventId) return;

    if (!get().consentGiven[eventId]) {
      set({ captureStatus: 'requesting_consent', error: 'Consent required' });
      return;
    }

    await get().startCapture(eventId);
  },

  addRoutePoint: (eventId: string, point: LocationPoint) => {
    set((state) => ({
      routeByEvent: {
        ...state.routeByEvent,
        [eventId]: [...(state.routeByEvent[eventId] ?? []), point],
      },
    }));
  },

  clearRoute: (eventId: string) => {
    set((state) => {
      const routeByEvent = { ...state.routeByEvent };
      delete routeByEvent[eventId];
      return { routeByEvent };
    });
  },

  giveConsent: (eventId: string) => {
    set((state) => ({
      consentGiven: { ...state.consentGiven, [eventId]: true },
      captureStatus: state.captureStatus === 'requesting_consent' ? 'idle' : state.captureStatus,
      error: null,
    }));
    get().persistRoutes();
  },

  revokeConsent: (eventId: string) => {
    if (get().activeCaptureEventId === eventId) {
      get().stopCapture(eventId);
    }

    set((state) => ({
      consentGiven: { ...state.consentGiven, [eventId]: false },
    }));
    get().persistRoutes();
  },

  loadStoredRoutes: async (eventId?: string) => {
    try {
      let consent = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
      if (consent == null) {
        consent = await AsyncStorage.getItem(LEGACY_CONSENT_STORAGE_KEY);
        if (consent != null) await AsyncStorage.setItem(CONSENT_STORAGE_KEY, consent);
      }
      if (consent) {
        set({ consentGiven: JSON.parse(consent) as Record<string, boolean> });
      }

      if (!eventId) return;

      const route = await getRouteForEvent(eventId);
      set((state) => ({
        routeByEvent: {
          ...state.routeByEvent,
          [eventId]: route,
        },
      }));
    } catch {
      set({ error: 'Could not load stored routes' });
    }
  },

  persistRoutes: async () => {
    try {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(get().consentGiven));
    } catch {
      set({ error: 'Could not save location consent' });
    }
  },
}));

export const selectRouteForEvent = (eventId: string) => (state: LocationState) =>
  state.routeByEvent[eventId] ?? [];

export const selectHasConsent = (eventId: string) => (state: LocationState) =>
  state.consentGiven[eventId] ?? false;

export const selectCaptureStats = (eventId: string) => (state: LocationState) => {
  const points = state.routeByEvent[eventId] ?? [];
  if (points.length === 0) {
    return { distanceKm: 0, durationHours: 0, pointsCount: 0, placesCount: 0, stopsCount: 0 };
  }
  return {
    distanceKm: calculateRouteDistance(points),
    durationHours: calculateRouteDuration(points),
    pointsCount: points.length,
    placesCount: countPlacesVisited(points).length,
    stopsCount: detectStops(points).length,
  };
};
