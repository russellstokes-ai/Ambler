alter table event_participants add column if not exists updated_at timestamptz default now();
alter table media_assets add column if not exists updated_at timestamptz default now();
alter table location_points add column if not exists updated_at timestamptz default now();
alter table storybook_pages add column if not exists updated_at timestamptz default now();
alter table consent_records add column if not exists updated_at timestamptz default now();
alter table share_links add column if not exists updated_at timestamptz default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on profiles
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on events
for each row execute function public.set_updated_at();

create trigger set_event_participants_updated_at
before update on event_participants
for each row execute function public.set_updated_at();

create trigger set_media_assets_updated_at
before update on media_assets
for each row execute function public.set_updated_at();

create trigger set_location_points_updated_at
before update on location_points
for each row execute function public.set_updated_at();

create trigger set_storybooks_updated_at
before update on storybooks
for each row execute function public.set_updated_at();

create trigger set_storybook_pages_updated_at
before update on storybook_pages
for each row execute function public.set_updated_at();

create trigger set_consent_records_updated_at
before update on consent_records
for each row execute function public.set_updated_at();

create trigger set_share_links_updated_at
before update on share_links
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, auth_provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Vibe User'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
