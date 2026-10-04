create unique index if not exists idx_events_invite_code
on events (invite_code);

create index if not exists idx_events_organiser_id
on events (organiser_id);

create index if not exists idx_event_participants_event_id
on event_participants (event_id);

create index if not exists idx_event_participants_user_id
on event_participants (user_id);

create unique index if not exists idx_event_participants_event_user
on event_participants (event_id, user_id);

create index if not exists idx_media_assets_event_id
on media_assets (event_id);

create index if not exists idx_media_assets_uploader_id
on media_assets (uploader_id);

create index if not exists idx_location_points_event_id
on location_points (event_id);

create index if not exists idx_location_points_user_id
on location_points (user_id);

create index if not exists idx_storybooks_event_id
on storybooks (event_id);

create index if not exists idx_storybook_pages_storybook_id
on storybook_pages (storybook_id);

create index if not exists idx_consent_records_event_id
on consent_records (event_id);

create index if not exists idx_consent_records_user_id
on consent_records (user_id);

create index if not exists idx_share_links_storybook_id
on share_links (storybook_id);

create unique index if not exists idx_share_links_token
on share_links (token);
