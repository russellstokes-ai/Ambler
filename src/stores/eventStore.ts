import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import {
  VibeEventRecord,
  CreateEventInput,
  getAllEvents,
  getEventById,
  createEvent as svcCreateEvent,
  joinEvent as svcJoinEvent,
  leaveEvent as svcLeaveEvent,
  endEvent as svcEndEvent,
  updateEvent as svcUpdateEvent,
  deleteEvent as svcDeleteEvent,
  archiveEvent as svcArchiveEvent,
} from '../features/events/eventService';

interface EventState {
  events: VibeEventRecord[];
  activeEvent: VibeEventRecord | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  initStore: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  createEvent: (input: CreateEventInput) => Promise<VibeEventRecord>;
  setActiveEvent: (event: VibeEventRecord | null) => void;
  loadEventById: (id: string) => Promise<VibeEventRecord | null>;
  joinEventByCode: (inviteCode: string) => Promise<VibeEventRecord | null>;
  endEvent: (eventId: string, storyLength?: 'short' | 'standard' | 'epic') => Promise<VibeEventRecord | null>;
  leaveEvent: (eventId: string) => Promise<VibeEventRecord | null>;
  updateEvent: (eventId: string, updates: Partial<VibeEventRecord>) => Promise<VibeEventRecord | null>;
  archiveEvent: (eventId: string, archived?: boolean) => Promise<VibeEventRecord | null>;
  removeEvent: (eventId: string) => Promise<boolean>;
}

let participantChannel: RealtimeChannel | null = null;

function subscribeToParticipants(eventId: string, refresh: () => Promise<void>): void {
  if (participantChannel) {
    supabase.removeChannel(participantChannel);
    participantChannel = null;
  }

  participantChannel = supabase
    .channel(`event-participants-${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'event_participants', filter: `event_id=eq.${eventId}` },
      () => {
        refresh().catch(() => {});
      }
    )
    .subscribe();
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  activeEvent: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  initStore: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const events = await getAllEvents();
      set({ events, isLoading: false, isInitialized: true, error: null });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load events',
      });
    }
  },

  refreshEvents: async () => {
    set({ isLoading: true });
    try {
      const events = await getAllEvents();
      const current = get().activeEvent;
      set({
        events,
        activeEvent: current ? events.find((event) => event.id === current.id) ?? current : current,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to refresh events',
      });
    }
  },

  createEvent: async (input: CreateEventInput) => {
    set({ isLoading: true });
    try {
      const event = await svcCreateEvent(input);
      const events = await getAllEvents();
      set({ events, activeEvent: event, isLoading: false, error: null });
      subscribeToParticipants(event.id, async () => {
        await get().loadEventById(event.id);
      });
      return event;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to create event',
      });
      throw err;
    }
  },

  setActiveEvent: (event) => {
    set({ activeEvent: event });
    if (event) {
      subscribeToParticipants(event.id, async () => {
        await get().loadEventById(event.id);
      });
    }
  },

  loadEventById: async (id: string) => {
    set({ isLoading: true });
    try {
      const event = await getEventById(id);
      set({ activeEvent: event, isLoading: false, error: null });
      if (event) {
        subscribeToParticipants(event.id, async () => {
          await get().loadEventById(event.id);
        });
      }
      return event;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load event',
      });
      return null;
    }
  },

  joinEventByCode: async (inviteCode: string) => {
    set({ isLoading: true });
    try {
      const event = await svcJoinEvent(inviteCode);
      if (!event) {
        set({ isLoading: false, error: 'Invalid invite code' });
        return null;
      }

      const events = await getAllEvents();
      set({ events, activeEvent: event, isLoading: false, error: null });
      subscribeToParticipants(event.id, async () => {
        await get().loadEventById(event.id);
      });
      return event;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to join event',
      });
      return null;
    }
  },

  endEvent: async (eventId: string, storyLength: 'short' | 'standard' | 'epic' = 'standard') => {
    set({ isLoading: true });
    try {
      const event = await svcEndEvent(eventId, storyLength);
      const events = await getAllEvents();
      set({ events, activeEvent: event, isLoading: false, error: null });
      return event;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to end event',
      });
      return null;
    }
  },

  leaveEvent: async (eventId: string) => {
    set({ isLoading: true });
    try {
      const event = await svcLeaveEvent(eventId);
      const events = await getAllEvents();
      set({ events, activeEvent: null, isLoading: false, error: null });
      return event;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to leave event',
      });
      return null;
    }
  },

  updateEvent: async (eventId: string, updates: Partial<VibeEventRecord>) => {
    set({ isLoading: true });
    try {
      const event = await svcUpdateEvent(eventId, updates);
      const events = await getAllEvents();
      set({ events, activeEvent: event, isLoading: false, error: null });
      return event;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to update event',
      });
      return null;
    }
  },

  archiveEvent: async (eventId: string, archived = true) => {
    try {
      const event = await svcArchiveEvent(eventId, archived);
      const events = await getAllEvents();
      set({ events, activeEvent: event, error: null });
      return event;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to archive event' });
      return null;
    }
  },

  removeEvent: async (eventId: string) => {
    try {
      const success = await svcDeleteEvent(eventId);
      if (success) {
        const events = await getAllEvents();
        set({ events, activeEvent: null, error: null });
      }
      return success;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete event' });
      return false;
    }
  },
}));

export const selectActiveEvents = (state: EventState) =>
  state.events.filter((event) => event.status === 'upcoming' || event.status === 'live');

export const selectPastEvents = (state: EventState) =>
  state.events.filter((event) => event.status === 'ended');

export const selectIsOrganiser = (state: EventState) => {
  const activeEvent = state.activeEvent;
  if (!activeEvent) return false;
  const authUser = useAuthStore.getState().user;
  return activeEvent.participants.some((participant) => participant.isOrganiser && participant.id === authUser?.id);
};

export const selectParticipantCount = (state: EventState) =>
  state.activeEvent?.participants.length ?? 0;
