-- Ambler activity metrics + organiser story editing

alter table public.events
  add column if not exists is_archived boolean not null default false;

alter table public.location_points
  add column if not exists speed_mps numeric,
  add column if not exists altitude_m numeric;

-- Organisers can refine a generated story without requiring service-role access.
drop policy if exists "storybooks_update_organiser" on public.storybooks;
create policy "storybooks_update_organiser"
on public.storybooks for update
using (public.is_event_organiser(event_id))
with check (public.is_event_organiser(event_id));

-- Keep an optional edit trail inside the database. It is deliberately compact:
-- the canonical finished document remains storybooks.storybook_json.
create table if not exists public.storybook_edits (
  id uuid primary key default uuid_generate_v4(),
  storybook_id uuid not null references public.storybooks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  edit_type text not null,
  edit_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists storybook_edits_storybook_idx
  on public.storybook_edits(storybook_id, created_at desc);

alter table public.storybook_edits enable row level security;

drop policy if exists "storybook_edits_select_organiser" on public.storybook_edits;
create policy "storybook_edits_select_organiser"
on public.storybook_edits for select
using (
  exists (
    select 1 from public.storybooks sb
    where sb.id = storybook_edits.storybook_id
      and public.is_event_organiser(sb.event_id)
  )
);

drop policy if exists "storybook_edits_insert_organiser" on public.storybook_edits;
create policy "storybook_edits_insert_organiser"
on public.storybook_edits for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.storybooks sb
    where sb.id = storybook_edits.storybook_id
      and public.is_event_organiser(sb.event_id)
  )
);

-- Archived events are no longer open for contributions. This keeps a hidden
-- event from accepting stale QR/browser uploads after the organiser archives it.
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
      and coalesce(e.is_archived, false) = false
  );
$$;

-- Recreate the invite join function so upgrades from migration 007 also enforce
-- the close/archive rule when somebody follows an old QR code.
drop function if exists public.join_event_by_code(text, text);
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

  if not public.event_accepts_contributions(target_event.id) then
    raise exception 'This event is no longer accepting contributions';
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

-- An organiser needs to be able to purge every participant's private objects
-- when permanently deleting the event. Uploaders retain their own delete policy.
drop policy if exists "event_media_organiser_delete" on storage.objects;
create policy "event_media_organiser_delete"
on storage.objects for delete
using (
  bucket_id = 'event-media'
  and public.is_event_organiser(((storage.foldername(name))[1])::uuid)
);

-- Organisers can moderate guest media in their own private event. This is
-- intentionally scoped to the event organiser; other participants can only
-- delete their own uploads.
drop policy if exists "media_assets_delete_uploader" on public.media_assets;
drop policy if exists "media_assets_delete_uploader_or_organiser" on public.media_assets;
create policy "media_assets_delete_uploader_or_organiser"
on public.media_assets for delete
using (
  auth.uid() = uploader_id
  or public.is_event_organiser(event_id)
);

-- Account deletion needs the object paths before auth/profile rows are removed.
-- The function only exposes paths belonging to uploads by the current user or
-- events organised by the current user.
create or replace function public.account_deletion_storage_paths()
returns table(path text)
language sql
security definer
set search_path = public
stable
as $$
  select distinct x.path
  from (
    select m.storage_path as path
    from public.media_assets m
    left join public.events e on e.id = m.event_id
    where m.uploader_id = auth.uid() or e.organiser_id = auth.uid()

    union all

    select m.thumbnail_path as path
    from public.media_assets m
    left join public.events e on e.id = m.event_id
    where (m.uploader_id = auth.uid() or e.organiser_id = auth.uid())
      and m.thumbnail_path is not null
  ) x
  where x.path is not null and x.path <> '';
$$;

grant execute on function public.account_deletion_storage_paths() to authenticated;

-- Bring the deletion RPC up to the current schema. User-authored captions and
-- reactions in somebody else's event are deleted too rather than silently left
-- behind with an anonymised profile reference.
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'not authenticated';
  end if;

  delete from public.media_reactions where user_id = current_user_id;
  delete from public.captions where user_id = current_user_id;
  delete from public.storybook_edits where user_id = current_user_id;

  delete from public.share_links
  where storybook_id in (
    select sb.id
    from public.storybooks sb
    join public.events e on e.id = sb.event_id
    where e.organiser_id = current_user_id
  );

  delete from public.storybook_pages
  where storybook_id in (
    select sb.id
    from public.storybooks sb
    join public.events e on e.id = sb.event_id
    where e.organiser_id = current_user_id
  );

  delete from public.storybooks
  where event_id in (select id from public.events where organiser_id = current_user_id);

  delete from public.media_assets
  where uploader_id = current_user_id
     or event_id in (select id from public.events where organiser_id = current_user_id);

  delete from public.location_points
  where user_id = current_user_id
     or event_id in (select id from public.events where organiser_id = current_user_id);

  delete from public.consent_records
  where user_id = current_user_id
     or event_id in (select id from public.events where organiser_id = current_user_id);

  delete from public.event_participants
  where user_id = current_user_id
     or event_id in (select id from public.events where organiser_id = current_user_id);

  delete from public.events where organiser_id = current_user_id;
  delete from public.profiles where id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

grant execute on function public.delete_user_account() to authenticated;
