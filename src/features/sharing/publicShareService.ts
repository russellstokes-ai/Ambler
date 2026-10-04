import { supabase } from '../../lib/supabase';
import type { Storybook } from '../../types';

export interface PublicSharedStory {
  id: string;
  storybookId: string;
  token: string;
  visibility: string;
  expiresAt?: string;
  createdAt: string;
  storybook?: Storybook;
  themeKey?: string;
}

function normalizeStorybook(value: unknown): Storybook | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as { storybook?: Storybook };
  return record.storybook ?? (value as Storybook);
}

function normalizePayload(payload: {
  id: string;
  storybook_id: string;
  token: string;
  visibility: string;
  expires_at?: string | null;
  created_at: string;
  storybook_json?: unknown;
  theme_key?: string | null;
}): PublicSharedStory {
  return {
    id: payload.id,
    storybookId: payload.storybook_id,
    token: payload.token,
    visibility: payload.visibility,
    expiresAt: payload.expires_at ?? undefined,
    createdAt: payload.created_at,
    storybook: normalizeStorybook(payload.storybook_json),
    themeKey: payload.theme_key ?? undefined,
  };
}

export async function getPublicSharedStory(token: string): Promise<PublicSharedStory | null> {
  const cleanToken = token.trim();
  if (!cleanToken) return null;

  // Preferred path: refresh private media URLs at request time so long-lived
  // story links do not contain expired one-hour signed URLs.
  const edge = await supabase.functions.invoke('public-story', { body: { token: cleanToken } });
  if (!edge.error && edge.data) {
    return normalizePayload(edge.data as Parameters<typeof normalizePayload>[0]);
  }

  // Safe fallback for installations that have applied the SQL migration but
  // have not deployed the Edge Function yet. This returns the story JSON but
  // cannot refresh expired storage URLs.
  const { data, error } = await supabase.rpc('get_shared_story', { share_token: cleanToken });
  if (error) throw error;
  if (!data) return null;
  return normalizePayload(data as Parameters<typeof normalizePayload>[0]);
}
