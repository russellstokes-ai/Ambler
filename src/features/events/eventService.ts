import { supabase } from '../../lib/supabase';
import { EventTypeKey, ThemeKey } from './eventTypes';

export type EventStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';

export interface EventParticipant {
  id: string;
  name: string;
  avatarColor: string;
  isOrganiser: boolean;
  joinedAt: string;
  mediaCount: number;
}

export interface VibeEventRecord {
  id: string;
  title: string;
  description?: string;
  type: EventTypeKey;
  theme: ThemeKey;
  startsAt: string;
  endsAt?: string;
  locationLabel: string;
  status: EventStatus;
  privacy: 'private' | 'shared' | 'public';
  participants: EventParticipant[];
  inviteCode: string;
  mediaCount: number;
  storybookId?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  type: EventTypeKey;
  theme: ThemeKey;
  startsAt: string;
  endsAt?: string;
  locationLabel: string;
  privacy?: 'private' | 'shared' | 'public';
}

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    const idx = Math.floor(Math.random() * INVITE_CHARS.length);
    code += INVITE_CHARS[idx];
  }
  return code;
}

export function generateEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const AVATAR_COLORS = [
  '#5B2CFF', '#EC3FA4', '#18C7D5', '#19C37D',
  '#FFB020', '#FF6B6B', '#4ECDC4', '#95E1D3',
  '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function avatarColorForId(id: string): string {
  const sum = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

type DbProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

type DbParticipant = {
  user_id: string;
  display_name: string | null;
  role: string | null;
  joined_at: string | null;
  profiles?: DbProfile | DbProfile[] | null;
};

type DbEvent = {
  id: string;
  organiser_id: string | null;
  title: string;
  description: string | null;
  event_type: string | null;
  theme_key: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location_label: string | null;
  status: string;
  privacy: string;
  invite_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_archived: boolean | null;
  event_participants?: DbParticipant[] | null;
  media_assets?: { id: string; uploader_id: string | null }[] | null;
  storybooks?: { id: string }[] | null;
};

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('You must be signed in');
  return data.user.id;
}

function firstProfile(value: DbProfile | DbProfile[] | null | undefined): DbProfile | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toParticipant(row: DbParticipant, organiserId: string | null, mediaCount = 0): EventParticipant {
  const profile = firstProfile(row.profiles);
  const userId = row.user_id;

  return {
    id: userId,
    name: row.display_name ?? profile?.display_name ?? 'Guest',
    avatarColor: avatarColorForId(userId),
    isOrganiser: row.role === 'organiser' || userId === organiserId,
    joinedAt: row.joined_at ?? new Date().toISOString(),
    mediaCount,
  };
}

function toEventRecord(row: DbEvent): VibeEventRecord {
  const mediaCountByUploader = new Map<string, number>();
  for (const media of row.media_assets ?? []) {
    if (!media.uploader_id) continue;
    mediaCountByUploader.set(media.uploader_id, (mediaCountByUploader.get(media.uploader_id) ?? 0) + 1);
  }

  const participants = (row.event_participants ?? [])
    .filter((participant) => Boolean(participant.user_id))
    .map((participant) => toParticipant(
      participant,
      row.organiser_id,
      mediaCountByUploader.get(participant.user_id) ?? 0,
    ));

  const createdAt = row.created_at ?? new Date().toISOString();
  const storybookId = row.storybooks?.[0]?.id;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: (row.event_type ?? 'custom') as EventTypeKey,
    theme: (row.theme_key ?? 'cinematic') as ThemeKey,
    startsAt: row.starts_at ?? createdAt,
    endsAt: row.ends_at ?? undefined,
    locationLabel: row.location_label ?? 'Location TBD',
    status: row.status as EventStatus,
    privacy: row.privacy as 'private' | 'shared' | 'public',
    participants,
    inviteCode: row.invite_code ?? '',
    mediaCount: row.media_assets?.length ?? 0,
    storybookId,
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
    archived: Boolean(row.is_archived),
  };
}

const eventSelect = `
  id,
  organiser_id,
  title,
  description,
  event_type,
  theme_key,
  starts_at,
  ends_at,
  location_label,
  status,
  privacy,
  invite_code,
  created_at,
  updated_at,
  is_archived,
  event_participants(
    user_id,
    display_name,
    role,
    joined_at,
    profiles(display_name, avatar_url)
  ),
  media_assets(id,uploader_id),
  storybooks(id)
`;

export async function getAllEvents(): Promise<VibeEventRecord[]> {
  await requireUserId();

  const { data, error } = await supabase
    .from('events')
    .select(eventSelect)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as DbEvent[]).map(toEventRecord);
}

export async function getEventById(id: string): Promise<VibeEventRecord | null> {
  await requireUserId();

  const { data, error } = await supabase
    .from('events')
    .select(eventSelect)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toEventRecord(data as unknown as DbEvent) : null;
}

export async function getEventByInviteCode(code: string): Promise<VibeEventRecord | null> {
  const { data, error } = await supabase
    .from('events')
    .select(eventSelect)
    .eq('invite_code', code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data ? toEventRecord(data as unknown as DbEvent) : null;
}

export async function createEvent(input: CreateEventInput): Promise<VibeEventRecord> {
  const userId = await requireUserId();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;

  let inserted: { id: string } | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
    const inviteCode = generateInviteCode();
    const { data, error } = await supabase
      .from('events')
      .insert({
        organiser_id: userId,
        title: input.title,
        description: input.description ?? null,
        event_type: input.type,
        theme_key: input.theme,
        starts_at: input.startsAt,
        ends_at: input.endsAt ?? null,
        location_label: input.locationLabel,
        status: 'upcoming',
        privacy: input.privacy ?? 'shared',
        invite_code: inviteCode,
      })
      .select('id')
      .single();

    if (!error) {
      inserted = data;
      break;
    }

    lastError = error;
    if (error.code !== '23505') break;
  }

  if (!inserted) throw lastError ?? new Error('Failed to create event');

  const { error: participantError } = await supabase
    .from('event_participants')
    .insert({
      event_id: inserted.id,
      user_id: userId,
      display_name: profile?.display_name ?? 'Organiser',
      role: 'organiser',
      media_consent: true,
      location_consent: false,
    });

  if (participantError) throw participantError;

  const event = await getEventById(inserted.id);
  if (!event) throw new Error('Created event could not be loaded');
  return event;
}

export async function updateEvent(id: string, updates: Partial<VibeEventRecord>): Promise<VibeEventRecord | null> {
  const patch: Record<string, unknown> = {};

  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.description !== undefined) patch.description = updates.description ?? null;
  if (updates.type !== undefined) patch.event_type = updates.type;
  if (updates.theme !== undefined) patch.theme_key = updates.theme;
  if (updates.startsAt !== undefined) patch.starts_at = updates.startsAt;
  if (updates.endsAt !== undefined) patch.ends_at = updates.endsAt;
  if (updates.locationLabel !== undefined) patch.location_label = updates.locationLabel;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.privacy !== undefined) patch.privacy = updates.privacy;
  if (updates.inviteCode !== undefined) patch.invite_code = updates.inviteCode;
  if (updates.archived !== undefined) patch.is_archived = updates.archived;

  const { error } = await supabase.from('events').update(patch).eq('id', id);
  if (error) throw error;

  return getEventById(id);
}

export async function joinEvent(inviteCode: string, guestName?: string): Promise<VibeEventRecord | null> {
  const { data, error } = await supabase.rpc('join_event_by_code', {
    invite_code: inviteCode.toUpperCase(),
    guest_name: guestName?.trim() || null,
  });

  if (error) throw error;

  const eventId = typeof data === 'string' ? data : data?.event_id;
  if (!eventId) return null;
  return getEventById(eventId);
}

export async function joinEventAsGuest(inviteCode: string, displayName: string): Promise<VibeEventRecord | null> {
  const cleanName = displayName.trim();
  if (!cleanName) throw new Error('Enter your name to join.');

  let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (!sessionData.session?.user) {
    const anonymous = await supabase.auth.signInAnonymously();
    if (anonymous.error) throw anonymous.error;
    sessionData = { session: anonymous.data.session };
  }

  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error('Could not start a guest session.');

  const isAnonymousSession = Boolean(sessionData.session?.user?.is_anonymous);
  const profilePayload: Record<string, unknown> = {
    id: userId,
    display_name: cleanName,
    updated_at: new Date().toISOString(),
  };
  if (isAnonymousSession) profilePayload.auth_provider = 'anonymous';

  const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
  if (profileError) throw profileError;

  return joinEvent(inviteCode, cleanName);
}

export async function removeParticipant(eventId: string, userId: string): Promise<VibeEventRecord | null> {
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
  return getEventById(eventId);
}

export async function leaveEvent(eventId: string): Promise<VibeEventRecord | null> {
  const userId = await requireUserId();
  return removeParticipant(eventId, userId);
}

export async function endEvent(eventId: string, storyLength: 'short' | 'standard' | 'epic' = 'standard'): Promise<VibeEventRecord | null> {
  const endedAt = new Date().toISOString();
  const { error } = await supabase
    .from('events')
    .update({ status: 'ended', ends_at: endedAt })
    .eq('id', eventId);

  if (error) throw error;

  const generation = await supabase.functions.invoke('generate-storybook', {
    body: { eventId, storyLength },
  });
  if (generation.error) {
    // Do not strand the organiser in an ended event with no story. Reopen it so
    // they can retry after connectivity/backend recovery.
    await supabase.from('events').update({ status: 'active', ends_at: null }).eq('id', eventId);
    throw new Error(`Ambler could not start the story build: ${generation.error.message}`);
  }

  return getEventById(eventId);
}


export async function archiveEvent(eventId: string, archived = true): Promise<VibeEventRecord | null> {
  const { error } = await supabase.from('events').update({ is_archived: archived }).eq('id', eventId);
  if (error) throw error;
  return getEventById(eventId);
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  await requireUserId();

  // Remove private storage objects before deleting the database rows. Event-row
  // cascades cannot delete Supabase Storage objects, so skipping this step would
  // leave guest media orphaned and continue consuming storage after deletion.
  const { data: mediaRows, error: mediaError } = await supabase
    .from('media_assets')
    .select('storage_path,thumbnail_path')
    .eq('event_id', eventId);

  if (mediaError) throw mediaError;

  const storagePaths = Array.from(new Set(
    (mediaRows ?? [])
      .flatMap((row) => [row.storage_path, row.thumbnail_path])
      .filter((path): path is string => Boolean(path)),
  ));

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('event-media').remove(storagePaths);
    if (storageError) throw storageError;
  }

  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
  return true;
}
