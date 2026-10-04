-- Ambler story + guest contribution upgrade
-- Safe upgrade for existing Vibe Loop/Ambler databases.

alter table public.events
  add column if not exists description text,
  add column if not exists theme_key text not null default 'cinematic';

-- Ensure the join RPC can upsert one participant per event/user.
with ranked as (
  select id,
         row_number() over (partition by event_id, user_id order by joined_at nulls last, id) as rn
  from public.event_participants
)
delete from public.event_participants ep
using ranked r
where ep.id = r.id and r.rn > 1;

create unique index if not exists event_participants_event_user_key
  on public.event_participants(event_id, user_id);

create table if not exists public.captions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  media_id uuid references public.media_assets(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists captions_event_created_idx
  on public.captions(event_id, created_at);

create table if not exists public.media_reactions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'heart' check (reaction in ('heart')),
  created_at timestamptz not null default now(),
  unique(media_id, user_id, reaction)
);

create index if not exists media_reactions_event_idx on public.media_reactions(event_id);
create index if not exists media_reactions_media_idx on public.media_reactions(media_id);

alter table public.captions enable row level security;
alter table public.media_reactions enable row level security;

-- Contributions close when an organiser ends or cancels the event. Keeping this
-- check server-side prevents a stale guest browser from uploading after closure.
create or replace function public.event_accepts_contributions(target_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id
      and e.status not in ('ended', 'cancelled')
  );
$$;

-- Recreate policies idempotently.
drop policy if exists "captions_select_event_participants" on public.captions;
create policy "captions_select_event_participants"
on public.captions for select
using (public.is_event_participant(event_id));

drop policy if exists "captions_insert_self" on public.captions;
create policy "captions_insert_self"
on public.captions for insert
with check (
  auth.uid() = user_id
  and public.is_event_participant(event_id)
  and public.event_accepts_contributions(event_id)
  and (
    media_id is null
    or exists (select 1 from public.media_assets m where m.id = media_id and m.event_id = event_id)
  )
);

drop policy if exists "captions_update_self" on public.captions;
create policy "captions_update_self"
on public.captions for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and public.is_event_participant(event_id)
  and public.event_accepts_contributions(event_id)
  and (
    media_id is null
    or exists (select 1 from public.media_assets m where m.id = media_id and m.event_id = event_id)
  )
);

drop policy if exists "captions_delete_self_or_organiser" on public.captions;
create policy "captions_delete_self_or_organiser"
on public.captions for delete
using (auth.uid() = user_id or public.is_event_organiser(event_id));

drop policy if exists "media_reactions_select_event_participants" on public.media_reactions;
create policy "media_reactions_select_event_participants"
on public.media_reactions for select
using (public.is_event_participant(event_id));

drop policy if exists "media_reactions_insert_self" on public.media_reactions;
create policy "media_reactions_insert_self"
on public.media_reactions for insert
with check (
  auth.uid() = user_id
  and public.is_event_participant(event_id)
  and public.event_accepts_contributions(event_id)
  and exists (select 1 from public.media_assets m where m.id = media_id and m.event_id = event_id)
);

drop policy if exists "media_reactions_delete_self" on public.media_reactions;
create policy "media_reactions_delete_self"
on public.media_reactions for delete
using (auth.uid() = user_id);

-- Existing media/storage policies are replaced so the close-event rule is
-- enforced by Postgres, not merely by the UI.
drop policy if exists "media_assets_insert_uploader" on public.media_assets;
create policy "media_assets_insert_uploader"
on public.media_assets for insert
with check (
  auth.uid() = uploader_id
  and public.is_event_participant(event_id)
  and public.event_accepts_contributions(event_id)
);

drop policy if exists "event_media_uploader_write" on storage.objects;
create policy "event_media_uploader_write"
on storage.objects for insert
with check (
  bucket_id = 'event-media'
  and auth.uid()::text = (storage.foldername(name))[2]
  and public.is_event_participant(((storage.foldername(name))[1])::uuid)
  and public.event_accepts_contributions(((storage.foldername(name))[1])::uuid)
);

-- Share links should not be enumerable by anonymous clients.
drop policy if exists "share_links_select_public_token" on public.share_links;

drop policy if exists "share_links_select_organiser" on public.share_links;
create policy "share_links_select_organiser"
on public.share_links for select
using (
  exists (
    select 1
    from public.storybooks sb
    where sb.id = share_links.storybook_id
      and public.is_event_organiser(sb.event_id)
  )
);

drop policy if exists "share_links_insert_organiser" on public.share_links;
create policy "share_links_insert_organiser"
on public.share_links for insert
with check (
  exists (
    select 1
    from public.storybooks sb
    where sb.id = share_links.storybook_id
      and public.is_event_organiser(sb.event_id)
  )
);

drop policy if exists "share_links_delete_organiser" on public.share_links;
create policy "share_links_delete_organiser"
on public.share_links for delete
using (
  exists (
    select 1
    from public.storybooks sb
    where sb.id = share_links.storybook_id
      and public.is_event_organiser(sb.event_id)
  )
);

-- Token-gated public read. The caller must already possess the high-entropy token.
create or replace function public.get_shared_story(share_token text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', sl.id,
    'storybook_id', sl.storybook_id,
    'token', sl.token,
    'visibility', sl.visibility,
    'expires_at', sl.expires_at,
    'created_at', sl.created_at,
    'storybook_json', sb.storybook_json,
    'theme_key', sb.theme_key,
    'title', sb.title,
    'event_id', sb.event_id
  )
  from public.share_links sl
  join public.storybooks sb on sb.id = sl.storybook_id
  where sl.token = share_token
    and (sl.expires_at is null or sl.expires_at > now())
    and sb.status = 'complete'
  limit 1;
$$;

grant execute on function public.get_shared_story(text) to anon, authenticated;

-- Join by invite code without exposing event rows before membership exists.
-- Remove the older single-argument version so RPC resolution stays unambiguous.
drop function if exists public.join_event_by_code(text);
create or replace function public.join_event_by_code(invite_code text, guest_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event events%rowtype;
  current_display_name text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select *
  into target_event
  from public.events e
  where e.invite_code = upper(join_event_by_code.invite_code)
  limit 1;

  if target_event.id is null then
    return null;
  end if;

  select display_name
  into current_display_name
  from public.profiles
  where id = auth.uid();

  current_display_name := coalesce(nullif(trim(guest_name), ''), current_display_name, 'Guest');

  insert into public.profiles (id, display_name, auth_provider, updated_at)
  values (auth.uid(), current_display_name, 'anonymous', now())
  on conflict (id) do update set
    display_name = excluded.display_name,
    updated_at = excluded.updated_at;

  insert into public.event_participants
    (event_id, user_id, display_name, role, media_consent, location_consent, is_removed)
  values
    (target_event.id, auth.uid(), current_display_name, 'guest', true, false, false)
  on conflict (event_id, user_id) do update set
    is_removed = false,
    display_name = excluded.display_name,
    media_consent = true;

  return target_event.id;
end;
$$;

grant execute on function public.join_event_by_code(text, text) to authenticated;
