// @ts-nocheck — Deno Edge Function (runs in Deno, not app TypeScript context)
// Supabase Edge Function — Storybook Generation
// Accepts POST { eventId } → fetches event data → runs engine pipeline → returns storybook JSON.
//
// Fetches from Supabase tables (events, media_assets, location_points, event_participants)
// and writes generated output to storybooks + storybook_pages.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

// ─── Engine Types (inline for Edge Function) ───────────────────

interface EngineInput {
  event: {
    id: string;
    title: string;
    type: string;
    startsAt: string;
    endsAt?: string;
    locationLabel: string;
    coverUrl?: string;
  };
  media: EngineMediaItem[];
  locations: EngineLocationPoint[];
  captions: EngineCaption[];
  theme: string;
  storyLength?: 'short' | 'standard' | 'epic';
  privacySettings: {
    blurPrivateLocations: boolean;
    shareSafeMode: boolean;
  };
}

interface EngineMediaItem {
  id: string;
  uri: string;
  storagePath?: string;
  thumbnailUri?: string;
  thumbnailPath?: string;
  capturedAt: string;
  uploaderName: string;
  uploaderId?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  mediaType: 'photo' | 'video';
  reactions?: number;
  comments?: string[];
  sharpnessScore?: number;
  brightnessScore?: number;
  colorVibrancyScore?: number;
  faceDetected?: boolean;
  isGroupShot?: boolean;
  gpsLat?: number;
  gpsLng?: number;
  placeLabel?: string;
}

interface EngineLocationPoint {
  latitude: number;
  longitude: number;
  capturedAt: string;
  placeLabel?: string;
  accuracyM?: number;
  speedMps?: number;
  altitudeM?: number;
}

interface EngineCaption {
  id: string;
  userId?: string;
  name: string;
  text: string;
  mediaId?: string;
  createdAt: string;
}

// ─── Pipeline Runner ───────────────────────────────────────────

async function runEngine(input: EngineInput): Promise<unknown> {
  try {
    const mod = await import('../../../src/features/storybook/engine/index.ts');
    if (typeof mod.generateStorybook === 'function') {
      return await mod.generateStorybook(input);
    }
  } catch (error) {
    console.error('Full Ambler story engine could not be loaded', error);
  }

  // Never silently ship the weaker inline fallback in production. A clear failure
  // is recoverable; a quietly inferior finished story damages the core product.
  throw new Error('Full Ambler story engine is unavailable in this deployment');
}

function generateStorybookInline(input: EngineInput): unknown {
  const sortedMedia = [...input.media].sort((a, b) => scoreMedia(b, input.media) - scoreMedia(a, input.media));
  const byTime = [...input.media].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
  const route = summarizeRoute(input.locations);
  const chapters = buildInlineChapters(byTime);
  const coverPhoto = sortedMedia[0] ?? null;
  const heroGallery = sortedMedia.slice(0, 18);
  const insights = buildInlineInsights(input, route);
  const qualityScore = {
    visualImpact: heroGallery.length ? Math.round(heroGallery.reduce((sum, item) => sum + scoreMedia(item, input.media), 0) / heroGallery.length) : 0,
    narrativeFlow: chapters.length >= 3 ? 82 : chapters.length === 2 ? 68 : 35,
    photoDiversity: Math.min(100, new Set(input.media.map((m) => m.uploaderName)).size * 16 + new Set(input.media.map((m) => m.capturedAt.slice(0, 13))).size * 5),
    timelineCompleteness: input.media.length >= 20 ? 84 : input.media.length >= 8 ? 65 : 25,
    routeCompleteness: route.points.length >= 20 ? 86 : route.points.length > 0 ? 62 : input.event.type === 'road_trip' ? 25 : 70,
    shareability: input.captions.length >= 8 && input.media.length >= 20 ? 88 : input.captions.length > 0 ? 66 : 35,
  };
  const overall = Math.round(
    qualityScore.visualImpact * 0.25 +
    qualityScore.narrativeFlow * 0.2 +
    qualityScore.photoDiversity * 0.15 +
    qualityScore.timelineCompleteness * 0.15 +
    qualityScore.routeCompleteness * 0.1 +
    qualityScore.shareability * 0.15,
  );
  const status = overall > 75 ? 'ready' : overall >= 60 ? 'good_with_suggestions' : 'needs_more_content';

  return {
    storybook: {
      id: `storybook_${input.event.id}`,
      eventId: input.event.id,
      title: input.event.title,
      qualityScore,
      pages: [
        {
          id: 'cover',
          type: 'cover',
          title: input.event.title,
          subtitle: `${input.event.locationLabel} · ${formatDate(input.event.startsAt)}`,
          data: { heroMedia: coverPhoto, insightTeasers: insights.slice(0, 4), theme: input.theme },
        },
        {
          id: 'cinematic-opening',
          type: 'cinematic_opening',
          title: 'The moments that mattered',
          subtitle: 'A story worth reliving',
          data: { media: byTime.slice(0, 8), theme: input.theme },
        },
        {
          id: 'timeline',
          type: 'timeline',
          title: 'How it unfolded',
          data: { chapters, theme: input.theme },
        },
        {
          id: 'route-replay',
          type: 'route_replay',
          title: 'Where the day went',
          data: { route, theme: input.theme },
        },
        {
          id: 'hero-gallery',
          type: 'hero_gallery',
          title: `The best of ${input.event.title}`,
          data: { media: heroGallery, theme: input.theme },
        },
        {
          id: 'story-insights',
          type: 'story_insights',
          title: 'Story Insights',
          data: { insights, theme: input.theme },
        },
        {
          id: 'friend-captions',
          type: 'friend_captions',
          title: 'What everyone said',
          data: { captions: input.captions.slice(0, 12), theme: input.theme },
        },
        {
          id: 'share',
          type: 'share',
          title: 'Share the story',
          data: {
            shareCardVertical: `${input.event.title} — ${insights[1]?.value ?? 'moments'} in one story`,
            shareCardSquare: `Your ${input.event.type.replaceAll('_', ' ')} storybook is ready`,
            theme: input.theme,
          },
        },
      ],
    },
    status,
    suggestions: status === 'ready' ? [] : buildInlineSuggestions(input, route),
    insights,
    route,
    chapters,
  };
}

function scoreMedia(item: EngineMediaItem, allMedia: EngineMediaItem[]): number {
  const sharpness = item.sharpnessScore ?? 60;
  const brightness = 100 - Math.abs((item.brightnessScore ?? 60) - 65) * 1.5;
  const vibrancy = item.colorVibrancyScore ?? 60;
  const social = Math.min(100, (item.reactions ?? 0) * 5 + (item.comments?.length ?? 0) * 3);
  const composition = Math.min(100, 60 + (item.isGroupShot ? 15 : 0) + (item.faceDetected ? 5 : 0) + (item.width && item.height && item.width > item.height ? 8 : 4));
  const temporal = Math.min(100, allMedia.filter((m) => Math.abs(new Date(m.capturedAt).getTime() - new Date(item.capturedAt).getTime()) <= 10 * 60000).length * 10 + 45);
  return Math.round(sharpness * 0.25 + brightness * 0.1 + vibrancy * 0.15 + social * 0.2 + composition * 0.15 + temporal * 0.15);
}

function summarizeRoute(locations: EngineLocationPoint[]) {
  const points = locations
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .map((l) => ({ lat: l.latitude, lng: l.longitude, capturedAt: l.capturedAt }));
  let totalDistanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistanceKm += haversine(points[i - 1]!.lat, points[i - 1]!.lng, points[i]!.lat, points[i]!.lng);
  }
  const placesVisited = Array.from(new Set(locations.map((l) => l.placeLabel).filter(Boolean)));
  const stops = placesVisited.map((placeLabel, index) => {
    const loc = locations.find((l) => l.placeLabel === placeLabel)!;
    return { id: `stop_${index + 1}`, lat: loc.latitude, lng: loc.longitude, placeLabel, durationMin: 20 };
  });
  return {
    points,
    stops,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationHours: points.length > 1 ? Math.round(((new Date(points[points.length - 1]!.capturedAt).getTime() - new Date(points[0]!.capturedAt).getTime()) / 3600000) * 10) / 10 : 0,
    placesVisited,
    blurredPoints: points.slice(0, 1).concat(points.slice(-1)),
    hasRoute: points.length > 0,
  };
}

function buildInlineChapters(media: EngineMediaItem[]) {
  if (media.length === 0) return [];
  const chapterCount = Math.min(5, Math.max(1, Math.ceil(media.length / 8)));
  const titles = ['Departure', 'The Road', 'Arrival', 'Exploring', 'The Return'];
  const size = Math.ceil(media.length / chapterCount);
  return Array.from({ length: chapterCount }, (_, index) => {
    const slice = media.slice(index * size, (index + 1) * size);
    return {
      id: `chapter_${index + 1}`,
      title: titles[index] ?? `Chapter ${index + 1}`,
      timeRange: slice.length ? `${formatTime(slice[0]!.capturedAt)} - ${formatTime(slice[slice.length - 1]!.capturedAt)}` : '',
      startTime: slice[0]?.capturedAt,
      endTime: slice[slice.length - 1]?.capturedAt,
      mediaCount: slice.length,
      highlights: slice.slice(0, 3),
      density: slice.length > 8 ? 'dense' : slice.length > 3 ? 'moderate' : 'sparse',
    };
  });
}

function buildInlineInsights(input: EngineInput, route: ReturnType<typeof summarizeRoute>) {
  const durationHours = input.event.endsAt
    ? Math.max(1, Math.round((new Date(input.event.endsAt).getTime() - new Date(input.event.startsAt).getTime()) / 3600000))
    : 0;
  return [
    { key: 'duration', label: 'Event length', value: durationHours > 24 ? `${Math.floor(durationHours / 24)}d ${durationHours % 24}h` : `${durationHours || 'Live'}h`, tone: 'stat' },
    { key: 'moments', label: 'Moments captured', value: `${input.media.length}`, tone: 'stat' },
    { key: 'places', label: 'Places visited', value: `${route.placesVisited.length}`, tone: 'stat' },
    ...(route.totalDistanceKm > 0 ? [{ key: 'distance', label: 'Distance covered', value: `${route.totalDistanceKm} km`, tone: 'stat' }] : []),
    { key: 'peak', label: 'Peak moment', value: input.media[Math.floor(input.media.length * 0.6)] ? formatTime(input.media[Math.floor(input.media.length * 0.6)]!.capturedAt) : 'Unknown', tone: 'memory' },
    { key: 'contributors', label: 'People who shared', value: `${new Set(input.media.map((m) => m.uploaderName)).size} friends`, tone: 'stat' },
    { key: 'topVibe', label: 'Top vibe', value: input.event.type === 'road_trip' ? 'Road trip energy' : 'Memorable moments', tone: 'fun' },
    ...(input.event.type === 'road_trip' && route.stops.length ? [{ key: 'longestStop', label: 'Longest stop', value: route.stops[0]!.placeLabel ?? `${route.stops[0]!.durationMin} min`, tone: 'stat' }] : []),
  ];
}

function buildInlineSuggestions(input: EngineInput, route: ReturnType<typeof summarizeRoute>): string[] {
  const suggestions = [];
  if (input.media.length < 20) suggestions.push('Add more photos across the full event to strengthen the story.');
  if (input.captions.length < 4) suggestions.push('Add a few captions from friends to give the story more personality.');
  if (input.event.type === 'road_trip' && !route.hasRoute) suggestions.push('Add location points to unlock Route Replay.');
  return suggestions;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
}

// ─── Supabase Data Fetching ────────────────────────────────────

async function fetchEventData(supabaseUrl: string, supabaseKey: string, eventId: string): Promise<EngineInput | null> {
  try {
    // Fetch event
    const eventRes = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    const events = await eventRes.json();
    if (!events || events.length === 0) return null;
    const event = events[0];

    // Fetch media
    const mediaRes = await fetch(
      `${supabaseUrl}/rest/v1/media_assets?event_id=eq.${eventId}&is_deleted=eq.false&select=*,uploader:profiles!uploader_id(display_name),media_reactions(id)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      },
    );
    const mediaRows = await mediaRes.json();

    // Fetch location points
    const locRes = await fetch(
      `${supabaseUrl}/rest/v1/location_points?event_id=eq.${eventId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      },
    );
    const locRows = await locRes.json();

    const participantRes = await fetch(
      `${supabaseUrl}/rest/v1/event_participants?event_id=eq.${eventId}&is_removed=eq.false&select=user_id,display_name,profiles(display_name)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      },
    );
    const participantRows = await participantRes.json();
    const participantNames = new Map<string, string>();
    for (const participant of Array.isArray(participantRows) ? participantRows : []) {
      const profile = Array.isArray(participant.profiles) ? participant.profiles[0] : participant.profiles;
      participantNames.set(participant.user_id, participant.display_name ?? profile?.display_name ?? 'Guest');
    }

    const captionRes = await fetch(
      `${supabaseUrl}/rest/v1/captions?event_id=eq.${eventId}&select=id,user_id,display_name,text,media_id,created_at&order=created_at.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      },
    );
    const captionRows = captionRes.ok ? await captionRes.json() : [];
    const captions: EngineCaption[] = (Array.isArray(captionRows) ? captionRows : []).map((c) => ({
      id: c.id,
      userId: c.user_id ?? undefined,
      name: c.display_name ?? participantNames.get(c.user_id) ?? 'Guest',
      text: c.text,
      mediaId: c.media_id ?? undefined,
      createdAt: c.created_at ?? new Date().toISOString(),
    }));

    // Map to engine types
    const media: EngineMediaItem[] = await Promise.all(mediaRows.map(async (m: Record<string, unknown>) => {
      const storagePath = m.storage_path as string;
      const uploader = m.uploader as Record<string, unknown> | undefined;
      return {
        id: m.id as string,
        uri: await createSignedMediaUrl(supabaseUrl, supabaseKey, storagePath),
        storagePath,
        thumbnailUri: m.thumbnail_path ? await createSignedMediaUrl(supabaseUrl, supabaseKey, m.thumbnail_path as string) : undefined,
        thumbnailPath: m.thumbnail_path as string | undefined,
        capturedAt: (m.captured_at as string) ?? (m.uploaded_at as string) ?? new Date().toISOString(),
        uploaderName: uploader?.display_name as string ?? participantNames.get(m.uploader_id as string) ?? 'Guest',
        uploaderId: m.uploader_id as string | undefined,
        width: m.width as number | undefined,
        height: m.height as number | undefined,
        durationSeconds: m.duration_seconds as number | undefined,
        mediaType: (m.media_type as string) === 'video' ? 'video' : 'photo',
        sharpnessScore: m.quality_score as number | undefined,
        reactions: Array.isArray(m.media_reactions) ? m.media_reactions.length : 0,
      };
    }));

    const locations: EngineLocationPoint[] = locRows.map((l: Record<string, unknown>) => ({
      latitude: l.latitude as number,
      longitude: l.longitude as number,
      capturedAt: l.captured_at as string,
      placeLabel: l.place_label as string | undefined,
      accuracyM: l.accuracy_m as number | undefined,
      speedMps: l.speed_mps as number | undefined,
      altitudeM: l.altitude_m as number | undefined,
    }));

    return {
      event: {
        id: event.id,
        title: event.title,
        type: event.event_type ?? 'custom',
        startsAt: event.starts_at,
        endsAt: event.ends_at,
        locationLabel: event.location_label ?? '',
        coverUrl: event.cover_url,
      },
      media,
      locations,
      captions,
      theme: event.theme_key ?? event.selected_theme ?? 'cinematic',
      privacySettings: {
        blurPrivateLocations: true,
        shareSafeMode: false,
      },
    };
  } catch (err) {
    console.error('Error fetching event data:', err);
    return null;
  }
}

async function createSignedMediaUrl(supabaseUrl: string, supabaseKey: string, storagePath: string): Promise<string> {
  if (!storagePath || /^https?:\/\//.test(storagePath)) return storagePath;

  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/event-media/${storagePath}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });

  if (!response.ok) return storagePath;
  const body = await response.json();
  return body.signedURL ? `${supabaseUrl}/storage/v1${body.signedURL}` : storagePath;
}

async function createGeneratingStorybook(supabaseUrl: string, supabaseKey: string, input: EngineInput): Promise<string> {
  const lookup = await fetch(
    `${supabaseUrl}/rest/v1/storybooks?event_id=eq.${input.event.id}&select=id&order=created_at.desc&limit=1`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } },
  );
  if (!lookup.ok) throw new Error(`Failed to find existing storybook: ${await lookup.text()}`);
  const existing = await lookup.json();
  if (Array.isArray(existing) && existing[0]?.id) {
    await updateStorybookStatus(supabaseUrl, supabaseKey, existing[0].id, {
      title: input.event.title,
      status: 'generating',
      theme_key: input.theme,
      quality_score: {},
      storybook_json: {},
      generated_at: null,
    });
    return existing[0].id;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/storybooks`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      event_id: input.event.id,
      title: input.event.title,
      status: 'generating',
      theme_key: input.theme,
      quality_score: {},
      storybook_json: {},
    }),
  });

  if (!response.ok) throw new Error(`Failed to create storybook row: ${await response.text()}`);
  const rows = await response.json();
  return rows[0].id;
}

async function updateStorybookStatus(
  supabaseUrl: string,
  supabaseKey: string,
  storybookId: string,
  values: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(`${supabaseUrl}/rest/v1/storybooks?id=eq.${storybookId}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) throw new Error(`Failed to update storybook row: ${await response.text()}`);
}

async function writeStorybookPages(
  supabaseUrl: string,
  supabaseKey: string,
  storybookId: string,
  pages: Array<Record<string, unknown>>,
): Promise<void> {
  const clearResponse = await fetch(`${supabaseUrl}/rest/v1/storybook_pages?storybook_id=eq.${storybookId}`, {
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });
  if (!clearResponse.ok) throw new Error(`Failed to replace storybook pages: ${await clearResponse.text()}`);

  const pageRows = pages.map((page, index) => ({
    storybook_id: storybookId,
    page_type: page.type,
    sort_order: index,
    page_json: page,
  }));

  const response = await fetch(`${supabaseUrl}/rest/v1/storybook_pages`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageRows),
  });

  if (!response.ok) throw new Error(`Failed to write storybook pages: ${await response.text()}`);
}

async function getAuthenticatedUserId(req: Request, supabaseUrl: string, serviceKey: string): Promise<string | null> {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': authorization,
    },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user?.id === 'string' ? user.id : null;
}

async function isEventOrganiser(
  supabaseUrl: string,
  serviceKey: string,
  eventId: string,
  userId: string,
): Promise<boolean> {
  const params = new URLSearchParams({
    select: 'id',
    id: `eq.${eventId}`,
    organiser_id: `eq.${userId}`,
    limit: '1',
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/events?${params.toString()}`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  });
  if (!response.ok) return false;
  const rows = await response.json();
  return Array.isArray(rows) && rows.length === 1;
}

// ─── Main Handler ──────────────────────────────────────────────

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { eventId, previewOnly = false, storyLength = 'standard' } = await req.json();

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'eventId required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase service credentials are required' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const userId = await getAuthenticatedUserId(req, supabaseUrl, supabaseKey);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!(await isEventOrganiser(supabaseUrl, supabaseKey, eventId, userId))) {
      return new Response(JSON.stringify({ error: 'Only the event organiser can generate or regenerate this story' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const input = await fetchEventData(supabaseUrl, supabaseKey, eventId);
    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Event not found', eventId }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (storyLength === 'short' || storyLength === 'standard' || storyLength === 'epic') {
      input.storyLength = storyLength;
    }

    const storybookId = previewOnly ? null : await createGeneratingStorybook(supabaseUrl, supabaseKey, input);

    try {
      const result = await runEngine(input) as Record<string, unknown>;
      const storybook = result.storybook as Record<string, unknown>;
      const pages = (storybook.pages ?? []) as Array<Record<string, unknown>>;

      if (storybookId) {
        storybook.id = storybookId;
        await writeStorybookPages(supabaseUrl, supabaseKey, storybookId, pages);
        await updateStorybookStatus(supabaseUrl, supabaseKey, storybookId, {
          title: storybook.title ?? input.event.title,
          status: 'complete',
          theme_key: input.theme,
          quality_score: storybook.qualityScore ?? {},
          storybook_json: { ...result, storybook },
          generated_at: new Date().toISOString(),
        });
      }

      return new Response(
        JSON.stringify({ ...result, storybook, previewOnly: Boolean(previewOnly) }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    } catch (generationError) {
      if (storybookId) await updateStorybookStatus(supabaseUrl, supabaseKey, storybookId, {
        status: 'failed',
        storybook_json: {
          error: generationError instanceof Error ? generationError.message : 'Unknown error',
        },
      });
      throw generationError;
    }
  } catch (err) {
    console.error('Storybook generation error:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate storybook',
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
