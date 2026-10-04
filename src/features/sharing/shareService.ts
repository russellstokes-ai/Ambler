import { Share } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

import { Storybook } from '../../types';
import { supabase } from '../../lib/supabase';
import { storyShareUrl } from '../../config/links';

const SHARE_EXPIRY_DAYS = 30;

export interface ShareLinkRecord {
  id: string;
  storybookId: string;
  token: string;
  visibility: 'private' | 'public' | string;
  expiresAt?: string;
  createdAt: string;
  storybook?: Storybook;
  themeKey?: string;
}

type DbShareLink = {
  id: string;
  storybook_id: string;
  token: string;
  visibility: string;
  expires_at: string | null;
  created_at: string;
  storybooks?: {
    storybook_json: unknown;
  } | null;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function generateToken(): string {
  if (typeof Crypto.randomUUID === 'function') {
    return Crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

function normalizeStorybook(value: unknown): Storybook | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as { storybook?: Storybook };
  return record.storybook ?? (value as Storybook);
}

function toShareLink(row: DbShareLink): ShareLinkRecord {
  return {
    id: row.id,
    storybookId: row.storybook_id,
    token: row.token,
    visibility: row.visibility,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    storybook: normalizeStorybook(row.storybooks?.storybook_json),
  };
}

export async function createPrivateShareLink(storybookId: string): Promise<ShareLinkRecord> {
  const token = generateToken();
  const expiresAt = addDays(new Date(), SHARE_EXPIRY_DAYS).toISOString();

  const { data, error } = await supabase
    .from('share_links')
    .insert({
      storybook_id: storybookId,
      token,
      visibility: 'private',
      expires_at: expiresAt,
    })
    .select('id,storybook_id,token,visibility,expires_at,created_at')
    .single();

  if (error) throw error;
  return toShareLink(data as DbShareLink);
}

export { getPublicSharedStory } from './publicShareService';

export async function getShareLink(token: string): Promise<ShareLinkRecord | null> {
  const { getPublicSharedStory } = await import('./publicShareService');
  return getPublicSharedStory(token);
}

export async function revokeShareLink(token: string): Promise<void> {
  const { error } = await supabase
    .from('share_links')
    .delete()
    .eq('token', token);

  if (error) throw error;
}

export async function sharePrivateStorybook(storybookId: string): Promise<ShareLinkRecord> {
  const link = await createPrivateShareLink(storybookId);
  const url = storyShareUrl(link.token);
  await Share.share({ url, message: url });
  return link;
}

export async function shareExistingLink(token: string): Promise<void> {
  const url = storyShareUrl(token);
  await Share.share({ url, message: url });
}

export async function saveStorybookCardToCameraRoll(viewRef: Parameters<typeof captureRef>[0]): Promise<string> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) throw new Error('Media library permission is required');

  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
  });

  const asset = await MediaLibrary.createAssetAsync(uri);
  return asset.uri;
}

export { storyShareUrl as shareUrlForToken };
