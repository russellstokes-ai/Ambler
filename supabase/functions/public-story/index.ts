import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { token } = await req.json();
    if (typeof token !== 'string' || token.length < 16) return json({ error: 'Invalid share token' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRole) return json({ error: 'Server not configured' }, 500);

    const admin = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin
      .from('share_links')
      .select('id,storybook_id,token,visibility,expires_at,created_at,storybooks!inner(status,storybook_json,theme_key)')
      .eq('token', token)
      .maybeSingle();

    if (error) throw error;
    if (!data) return json({ error: 'Story not found' }, 404);
    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return json({ error: 'Share link expired' }, 410);

    const storybookRow = Array.isArray(data.storybooks) ? data.storybooks[0] : data.storybooks;
    if (!storybookRow || storybookRow.status !== 'complete') return json({ error: 'Story is not ready' }, 409);

    const signedCache = new Map<string, string>();
    async function signed(path: string): Promise<string> {
      const cached = signedCache.get(path);
      if (cached) return cached;
      const { data: signedData, error: signError } = await admin.storage
        .from('event-media')
        .createSignedUrl(path, 60 * 60 * 6);
      if (signError || !signedData?.signedUrl) return path;
      signedCache.set(path, signedData.signedUrl);
      return signedData.signedUrl;
    }

    async function hydrate(value: unknown): Promise<unknown> {
      if (Array.isArray(value)) return Promise.all(value.map(hydrate));
      if (!value || typeof value !== 'object') return value;

      const record = value as Record<string, unknown>;
      const next: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(record)) next[key] = await hydrate(child);

      if (typeof record.storagePath === 'string' && record.storagePath) {
        next.uri = await signed(record.storagePath);
      }
      if (typeof record.thumbnailPath === 'string' && record.thumbnailPath) {
        next.thumbnailUri = await signed(record.thumbnailPath);
      }
      return next;
    }

    const hydratedStorybook = await hydrate(storybookRow.storybook_json);
    return json({
      id: data.id,
      storybook_id: data.storybook_id,
      token: data.token,
      visibility: data.visibility,
      expires_at: data.expires_at,
      created_at: data.created_at,
      storybook_json: hydratedStorybook,
      theme_key: storybookRow.theme_key ?? 'cinematic',
    });
  } catch (error) {
    console.error('[public-story]', error);
    return json({ error: 'Could not load shared story' }, 500);
  }
});
