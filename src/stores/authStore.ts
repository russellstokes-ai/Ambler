import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { supabase } from '../lib/supabase';
import {
  completeOAuthSessionFromUrl,
  deleteAccount as svcDeleteAccount,
  signInWithProvider,
  signOut,
} from '../features/auth/authService';
import type { AuthProvider } from '../types';
import * as Linking from 'expo-linking';

export interface AmblerUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  provider: AuthProvider;
  profileCompleted: boolean;
}

interface AuthState {
  user: AmblerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithProvider: (provider: AuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeProfile: (displayName: string, avatarUrl?: string | null) => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

const ONBOARDING_KEY = 'ambler_onboarding_complete';
const LEGACY_ONBOARDING_KEY = 'vibe_loop_onboarding_complete';

function readProvider(value: unknown): AuthProvider {
  return value === 'facebook' || value === 'apple' ? value : 'google';
}

async function loadUser(userId: string): Promise<AmblerUser> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const authUser = authData.user;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, auth_provider')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;

  const metadata = authUser?.user_metadata ?? {};
  const displayName =
    profile?.display_name ??
    metadata.full_name ??
    metadata.name ??
    metadata.user_name ??
    'Ambler User';

  return {
    id: userId,
    displayName,
    avatarUrl: profile?.avatar_url ?? metadata.avatar_url ?? null,
    provider: readProvider(profile?.auth_provider ?? authUser?.app_metadata?.provider),
    profileCompleted: Boolean(profile?.display_name?.trim()),
  };
}

async function refreshAuthState(set: (state: Partial<AuthState>) => void): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (!data.session?.user) {
    set({ user: null, isAuthenticated: false, isLoading: false });
    return;
  }

  const user = await loadUser(data.session.user.id);
  set({ user, isAuthenticated: true, isLoading: false, error: null });
}

let authSubscriptionStarted = false;
let deepLinkSubscriptionStarted = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loginWithProvider: async (provider: AuthProvider) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithProvider(provider);
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Logout failed',
      });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await svcDeleteAccount();
      await AsyncStorage.multiRemove([ONBOARDING_KEY, LEGACY_ONBOARDING_KEY]);
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Account deletion failed',
      });
    }
  },

  completeProfile: async (displayName: string, avatarUrl?: string | null) => {
    const currentUser = get().user;
    if (!currentUser) {
      set({ error: 'No authenticated user' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const nextDisplayName = displayName.trim() || currentUser.displayName;
      const { error } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        display_name: nextDisplayName,
        avatar_url: avatarUrl ?? currentUser.avatarUrl,
        auth_provider: currentUser.provider,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      set({
        user: {
          ...currentUser,
          displayName: nextDisplayName,
          avatarUrl: avatarUrl ?? currentUser.avatarUrl,
          profileCompleted: true,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Profile update failed',
      });
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });

    if (!deepLinkSubscriptionStarted) {
      deepLinkSubscriptionStarted = true;

      Linking.getInitialURL()
        .then((url) => {
          if (url) return completeOAuthSessionFromUrl(url);
          return undefined;
        })
        .catch((err) => {
          set({ error: err instanceof Error ? err.message : 'Sign-in callback failed' });
        });

      Linking.addEventListener('url', ({ url }) => {
        completeOAuthSessionFromUrl(url).catch((err) => {
          set({ error: err instanceof Error ? err.message : 'Sign-in callback failed' });
        });
      });
    }

    if (!authSubscriptionStarted) {
      authSubscriptionStarted = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        loadUser(session.user.id)
          .then((user) => {
            set({ user, isAuthenticated: true, isLoading: false, error: null });
          })
          .catch((err) => {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Session refresh failed',
            });
          });
      });
    }

    try {
      await refreshAuthState(set);
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Session load failed',
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    let value = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (value == null) {
      value = await AsyncStorage.getItem(LEGACY_ONBOARDING_KEY);
      if (value != null) await AsyncStorage.setItem(ONBOARDING_KEY, value);
    }
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Keep onboarding non-blocking if local persistence fails.
  }
}
