-- Ambler hardening: joining a private event must happen through the invite-code RPC.
-- Direct self-insert would let any authenticated user join if an event UUID leaked.

drop policy if exists "event_participants_insert_self" on public.event_participants;
drop policy if exists "event_participants_insert_organiser" on public.event_participants;
create policy "event_participants_insert_organiser"
on public.event_participants for insert
with check (
  auth.uid() = user_id
  and role = 'organiser'
  and public.is_event_organiser(event_id)
);

-- Guest membership remains available only through the SECURITY DEFINER
-- join_event_by_code RPC created by migration 008.
