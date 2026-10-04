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

  delete from share_links
  where storybook_id in (
    select sb.id
    from storybooks sb
    join events e on e.id = sb.event_id
    where e.organiser_id = current_user_id
  );

  delete from storybook_pages
  where storybook_id in (
    select sb.id
    from storybooks sb
    join events e on e.id = sb.event_id
    where e.organiser_id = current_user_id
  );

  delete from storybooks
  where event_id in (select id from events where organiser_id = current_user_id);

  delete from media_assets
  where uploader_id = current_user_id
     or event_id in (select id from events where organiser_id = current_user_id);

  delete from location_points
  where user_id = current_user_id
     or event_id in (select id from events where organiser_id = current_user_id);

  delete from consent_records
  where user_id = current_user_id
     or event_id in (select id from events where organiser_id = current_user_id);

  delete from event_participants
  where user_id = current_user_id
     or event_id in (select id from events where organiser_id = current_user_id);

  delete from events
  where organiser_id = current_user_id;

  delete from profiles
  where id = current_user_id;

  delete from auth.users
  where id = current_user_id;
end;
$$;
