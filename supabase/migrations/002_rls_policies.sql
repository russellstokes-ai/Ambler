alter table profiles enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;
alter table media_assets enable row level security;
alter table location_points enable row level security;
alter table storybooks enable row level security;
alter table storybook_pages enable row level security;
alter table consent_records enable row level security;
alter table share_links enable row level security;

create or replace function public.is_event_participant(target_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from event_participants ep
    where ep.event_id = target_event_id
      and ep.user_id = auth.uid()
      and coalesce(ep.is_removed, false) = false
  );
$$;

create or replace function public.is_event_organiser(target_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from events e
    where e.id = target_event_id
      and e.organiser_id = auth.uid()
  );
$$;

create policy "profiles_select_own"
on profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_insert_own"
on profiles for insert
with check (auth.uid() = id);

create policy "events_insert_own"
on events for insert
with check (auth.uid() = organiser_id);

create policy "events_select_participants"
on events for select
using (public.is_event_participant(id));

create policy "events_update_organiser"
on events for update
using (auth.uid() = organiser_id)
with check (auth.uid() = organiser_id);

create policy "events_delete_organiser"
on events for delete
using (auth.uid() = organiser_id);

create policy "event_participants_insert_self"
on event_participants for insert
with check (auth.uid() = user_id);

create policy "event_participants_select_joined_events"
on event_participants for select
using (public.is_event_participant(event_id));

create policy "event_participants_delete_self_or_organiser"
on event_participants for delete
using (auth.uid() = user_id or public.is_event_organiser(event_id));

create policy "media_assets_insert_uploader"
on media_assets for insert
with check (auth.uid() = uploader_id and public.is_event_participant(event_id));

create policy "media_assets_select_event_participants"
on media_assets for select
using (public.is_event_participant(event_id) and coalesce(is_deleted, false) = false);

create policy "media_assets_delete_uploader"
on media_assets for delete
using (auth.uid() = uploader_id);

create policy "location_points_insert_own"
on location_points for insert
with check (auth.uid() = user_id and public.is_event_participant(event_id));

create policy "location_points_select_event_participants"
on location_points for select
using (public.is_event_participant(event_id));

create policy "storybooks_select_event_participants"
on storybooks for select
using (public.is_event_participant(event_id));

create policy "storybook_pages_select_event_participants"
on storybook_pages for select
using (
  exists (
    select 1
    from storybooks sb
    where sb.id = storybook_pages.storybook_id
      and public.is_event_participant(sb.event_id)
  )
);

create policy "share_links_select_public_token"
on share_links for select
using (token is not null and (expires_at is null or expires_at > now()));

create policy "consent_records_select_own"
on consent_records for select
using (auth.uid() = user_id);

create policy "consent_records_insert_own"
on consent_records for insert
with check (auth.uid() = user_id and public.is_event_participant(event_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-media', 'event-media', false, 52428800, array['image/*', 'video/*']),
  ('avatars', 'avatars', true, 5242880, array['image/*'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_owner_write"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_owner_delete"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "event_media_participants_read"
on storage.objects for select
using (
  bucket_id = 'event-media'
  and public.is_event_participant(((storage.foldername(name))[1])::uuid)
);

create policy "event_media_uploader_write"
on storage.objects for insert
with check (
  bucket_id = 'event-media'
  and auth.uid()::text = (storage.foldername(name))[2]
  and public.is_event_participant(((storage.foldername(name))[1])::uuid)
);

create policy "event_media_uploader_delete"
on storage.objects for delete
using (
  bucket_id = 'event-media'
  and auth.uid()::text = (storage.foldername(name))[2]
);

create or replace function public.join_event_by_code(invite_code text)
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
  from events e
  where e.invite_code = upper(join_event_by_code.invite_code)
  limit 1;

  if target_event.id is null then
    return null;
  end if;

  select display_name
  into current_display_name
  from profiles
  where id = auth.uid();

  insert into event_participants (event_id, user_id, display_name, role, media_consent, location_consent)
  values (target_event.id, auth.uid(), coalesce(current_display_name, 'Guest'), 'guest', true, false)
  on conflict (event_id, user_id) do update set
    is_removed = false,
    display_name = excluded.display_name;

  return target_event.id;
end;
$$;
