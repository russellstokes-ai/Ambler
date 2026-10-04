import { MusicSelection, Storybook, StorybookPage } from '../../types';
import { ThemeKey } from '../events/eventTypes';
import { supabase } from '../../lib/supabase';

export interface EditableStorybookRecord {
  id: string;
  eventId: string;
  themeKey: ThemeKey;
  storybook: Storybook;
}

export type StoryEditType =
  | 'page_copy'
  | 'page_order'
  | 'remove_media'
  | 'promote_media'
  | 'theme'
  | 'music'
  | 'caption_copy'
  | 'hide_location'
  | 'hide_person'
  | 'replace_section';

function normalizeStorybook(value: unknown): Storybook | null {
  if (!value || typeof value !== 'object') return null;
  const wrapped = value as { storybook?: Storybook };
  const storybook = wrapped.storybook ?? (value as Storybook);
  return Array.isArray(storybook.pages) ? storybook : null;
}

export async function loadEditableStorybook(storybookId: string): Promise<EditableStorybookRecord> {
  const { data, error } = await supabase
    .from('storybooks')
    .select('id,event_id,theme_key,storybook_json')
    .eq('id', storybookId)
    .single();
  if (error) throw error;
  const storybook = normalizeStorybook(data.storybook_json);
  if (!storybook) throw new Error('This story could not be opened for editing.');
  return {
    id: data.id,
    eventId: data.event_id,
    themeKey: (data.theme_key ?? 'cinematic') as ThemeKey,
    storybook,
  };
}

export async function saveEditableStorybook(
  record: EditableStorybookRecord,
  editType: StoryEditType,
  editJson: Record<string, unknown> = {},
): Promise<void> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const userId = userData.user?.id;
  if (!userId) throw new Error('Sign in to edit this story.');

  const { error } = await supabase
    .from('storybooks')
    .update({
      title: record.storybook.title,
      theme_key: record.themeKey,
      storybook_json: record.storybook,
    })
    .eq('id', record.id);
  if (error) throw error;

  // The story is already saved even if edit-history insertion is unavailable on
  // a database that has not applied migration 008 yet.
  try {
    await supabase.from('storybook_edits').insert({
      storybook_id: record.id,
      user_id: userId,
      edit_type: editType,
      edit_json: editJson,
    });
  } catch {
    // Edit history is best-effort; the storybook update above is authoritative.
  }
}

export function updatePageCopy(storybook: Storybook, pageId: string, title: string, subtitle?: string): Storybook {
  return mapPage(storybook, pageId, (page) => ({ ...page, title, subtitle: subtitle?.trim() || undefined }));
}

export function movePage(storybook: Storybook, pageId: string, direction: -1 | 1): Storybook {
  const pages = [...storybook.pages];
  const index = pages.findIndex((page) => page.id === pageId);
  if (index < 0) return storybook;
  const next = index + direction;
  // Keep cover first and share last. Everything between them is editable.
  if (next <= 0 || next >= pages.length - 1) return storybook;
  [pages[index], pages[next]] = [pages[next]!, pages[index]!];
  return { ...storybook, pages };
}

export function removeMediaFromStory(storybook: Storybook, mediaId: string): Storybook {
  const pages = storybook.pages.map((page) => ({ ...page, data: removeMediaDeep(page.data, mediaId) }));
  return { ...storybook, pages };
}

export function promoteMediaToCover(storybook: Storybook, media: Record<string, unknown>): Storybook {
  return mapPage(storybook, 'cover', (page) => ({ ...page, data: { ...page.data, heroMedia: media } }));
}

export function hideLocationFromStory(storybook: Storybook, label: string): Storybook {
  const needle = label.trim().toLowerCase();
  if (!needle) return storybook;
  const pages = storybook.pages.map((page) => {
    if (page.type !== 'route_replay') return page;
    const route = page.data.route as Record<string, unknown> | undefined;
    if (!route) return page;
    const stops = Array.isArray(route.stops)
      ? route.stops.filter((stop) => String((stop as { placeLabel?: string }).placeLabel ?? '').toLowerCase() !== needle)
      : route.stops;
    const placesVisited = Array.isArray(route.placesVisited)
      ? route.placesVisited.filter((place) => String(place).toLowerCase() !== needle)
      : route.placesVisited;
    return { ...page, data: { ...page.data, route: { ...route, stops, placesVisited } } };
  });
  return { ...storybook, pages };
}

export function hidePersonFromStory(storybook: Storybook, name: string): Storybook {
  const needle = name.trim().toLowerCase();
  if (!needle) return storybook;
  const pages = storybook.pages.map((page) => ({ ...page, data: removePersonDeep(page.data, needle) }));
  return { ...storybook, pages };
}


export function updateStoryMusic(storybook: Storybook, musicSelection?: MusicSelection): Storybook {
  return { ...storybook, musicSelection };
}

export function updateRenderedCaption(storybook: Storybook, pageId: string, captionIndex: number, text: string): Storybook {
  return mapPage(storybook, pageId, (page) => {
    if (page.type !== 'friend_captions') return page;
    const captions = Array.isArray(page.data.captions) ? [...page.data.captions] : [];
    const current = captions[captionIndex];
    if (!current || typeof current !== 'object') return page;
    captions[captionIndex] = { ...(current as Record<string, unknown>), text: text.trim() };
    return { ...page, data: { ...page.data, captions } };
  });
}

export async function regenerateStorySection(eventId: string, pageId: string): Promise<StorybookPage> {
  const { data, error } = await supabase.functions.invoke('generate-storybook', {
    body: { eventId, previewOnly: true },
  });
  if (error) throw error;
  const generated = normalizeStorybook(data?.storybook ?? data);
  if (!generated) throw new Error('Could not regenerate this section.');
  const replacement = generated.pages.find((page) => page.id === pageId)
    ?? generated.pages.find((page) => page.type === pageId as any);
  if (!replacement) throw new Error('That section was not produced by the latest story pass.');
  return replacement;
}

export function replaceStorySection(storybook: Storybook, pageId: string, replacement: StorybookPage): Storybook {
  return mapPage(storybook, pageId, () => replacement);
}

function mapPage(storybook: Storybook, pageId: string, fn: (page: StorybookPage) => StorybookPage): Storybook {
  return { ...storybook, pages: storybook.pages.map((page) => (page.id === pageId ? fn(page) : page)) };
}

function removeMediaDeep(value: unknown, mediaId: string): any {
  if (Array.isArray(value)) {
    return value
      .filter((item) => !isMediaRecord(item, mediaId))
      .map((item) => removeMediaDeep(item, mediaId));
  }
  if (value && typeof value === 'object') {
    if (isMediaRecord(value, mediaId)) return null;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, child]) => [key, removeMediaDeep(child, mediaId)])
        .filter(([, child]) => child !== null),
    );
  }
  return value;
}

function removePersonDeep(value: unknown, needle: string): any {
  if (Array.isArray(value)) {
    return value
      .filter((item) => {
        if (!item || typeof item !== 'object') return true;
        const record = item as Record<string, unknown>;
        const person = String(record.uploaderName ?? record.name ?? '').toLowerCase();
        return person !== needle;
      })
      .map((item) => removePersonDeep(item, needle));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, removePersonDeep(child, needle)]),
    );
  }
  return value;
}

function isMediaRecord(value: unknown, mediaId: string): boolean {
  if (!value || typeof value !== 'object') return false;
  return String((value as Record<string, unknown>).id ?? '') === mediaId;
}