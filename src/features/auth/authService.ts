import * as Linking from 'expo-linking';
import type { AuthResponse, OAuthResponse, UserResponse } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';
import type { AuthProvider } from '../../types';

const redirectTo = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? Linking.createURL('auth/callback');

function getQueryParam(url: string, key: string): string | null {
  const match = url.match(new RegExp(`[?&]${key}=([^&]+)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

export async function signInWithProvider(provider: AuthProvider): Promise<OAuthResponse['data']> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (data.url) {
    await Linking.openURL(data.url);
  }

  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function completeOAuthSessionFromUrl(url: string): Promise<void> {
  const code = getQueryParam(url, 'code');
  if (!code) return;

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  // Storage objects live outside Postgres and are not removed by FK cascades.
  // Ask the security-definer helper for only the current user's eligible paths,
  // purge those objects while the user's RLS permissions still exist, then
  // remove database/auth records.
  const { data: pathRows, error: pathError } = await supabase.rpc('account_deletion_storage_paths');
  if (pathError) throw pathError;

  const paths = Array.from(new Set(
    ((pathRows ?? []) as Array<{ path?: string | null }>)
      .map((row) => row.path)
      .filter((path): path is string => Boolean(path)),
  ));

  for (let index = 0; index < paths.length; index += 100) {
    const { error: storageError } = await supabase.storage
      .from('event-media')
      .remove(paths.slice(index, index + 100));
    if (storageError) throw storageError;
  }

  const { error } = await supabase.rpc('delete_user_account');
  if (error) throw error;

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) throw signOutError;
}

export async function getSession(): Promise<AuthResponse['data']['session'] | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(): Promise<UserResponse['data']['user'] | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
