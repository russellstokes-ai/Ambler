import { supabase } from '../../lib/supabase';

export interface EventCaption {
  id: string;
  eventId: string;
  mediaId?: string;
  userId?: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export async function addEventCaption(eventId: string, text: string, mediaId?: string): Promise<EventCaption> {
  const cleanText = text.trim();
  if (!cleanText) throw new Error('Write something first.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Join the event before adding a caption.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  const { data, error } = await supabase
    .from('captions')
    .insert({
      event_id: eventId,
      media_id: mediaId ?? null,
      user_id: authData.user.id,
      display_name: profile?.display_name ?? 'Guest',
      text: cleanText.slice(0, 500),
    })
    .select('id,event_id,media_id,user_id,display_name,text,created_at')
    .single();
  if (error) throw error;

  return {
    id: data.id,
    eventId: data.event_id,
    mediaId: data.media_id ?? undefined,
    userId: data.user_id ?? undefined,
    displayName: data.display_name ?? 'Guest',
    text: data.text,
    createdAt: data.created_at,
  };
}

export async function listEventCaptions(eventId: string): Promise<EventCaption[]> {
  const { data, error } = await supabase
    .from('captions')
    .select('id,event_id,media_id,user_id,display_name,text,created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    eventId: row.event_id,
    mediaId: row.media_id ?? undefined,
    userId: row.user_id ?? undefined,
    displayName: row.display_name ?? 'Guest',
    text: row.text,
    createdAt: row.created_at,
  }));
}

export async function toggleHeartReaction(eventId: string, mediaId: string): Promise<boolean> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Join the event before reacting.');

  const { data: existing, error: existingError } = await supabase
    .from('media_reactions')
    .select('id')
    .eq('media_id', mediaId)
    .eq('user_id', authData.user.id)
    .eq('reaction', 'heart')
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase.from('media_reactions').delete().eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('media_reactions').insert({
    event_id: eventId,
    media_id: mediaId,
    user_id: authData.user.id,
    reaction: 'heart',
  });
  if (error) throw error;
  return true;
}
