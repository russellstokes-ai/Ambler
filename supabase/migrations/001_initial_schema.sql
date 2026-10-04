create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key,
  display_name text not null,
  avatar_url text,
  auth_provider text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table events (
  id uuid primary key default uuid_generate_v4(),
  organiser_id uuid references profiles(id),
  title text not null,
  description text,
  event_type text,
  theme_key text not null default 'cinematic',
  starts_at timestamptz,
  ends_at timestamptz,
  location_label text,
  status text not null default 'draft',
  privacy text not null default 'private',
  invite_code text unique,
  route_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table event_participants (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id),
  display_name text,
  role text default 'guest',
  joined_at timestamptz default now(),
  media_consent boolean default true,
  location_consent boolean default false,
  is_removed boolean default false,
  unique(event_id, user_id)
);

create table media_assets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  uploader_id uuid references profiles(id),
  storage_path text not null,
  thumbnail_path text,
  media_type text not null,
  captured_at timestamptz,
  uploaded_at timestamptz default now(),
  width int,
  height int,
  duration_seconds numeric,
  upload_status text default 'uploaded',
  quality_score numeric,
  feature_score numeric,
  is_deleted boolean default false
);

create table captions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  media_id uuid references media_assets(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  display_name text,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table media_reactions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  media_id uuid not null references media_assets(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  reaction text not null default 'heart' check (reaction in ('heart')),
  created_at timestamptz default now(),
  unique(media_id, user_id, reaction)
);

create table location_points (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id),
  latitude numeric not null,
  longitude numeric not null,
  accuracy_m numeric,
  captured_at timestamptz not null,
  place_label text,
  is_private_blurred boolean default false
);

create table storybooks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  title text not null,
  status text default 'generating',
  theme_key text default 'vibe',
  quality_score jsonb default '{}'::jsonb,
  storybook_json jsonb default '{}'::jsonb,
  generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table storybook_pages (
  id uuid primary key default uuid_generate_v4(),
  storybook_id uuid references storybooks(id) on delete cascade,
  page_type text not null,
  sort_order int not null,
  page_json jsonb not null default '{}'::jsonb
);

create table consent_records (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id),
  user_id uuid references profiles(id),
  consent_type text not null,
  consent_value boolean not null,
  copy_version text,
  created_at timestamptz default now()
);

create table share_links (
  id uuid primary key default uuid_generate_v4(),
  storybook_id uuid references storybooks(id) on delete cascade,
  token text unique not null,
  visibility text default 'private',
  expires_at timestamptz,
  created_at timestamptz default now()
);
