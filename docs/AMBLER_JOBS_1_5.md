# Ambler — Jobs 1–5 integration checkpoint

This checkpoint completes the first end-to-end product pass around **Capture → Build → Relive**.

## 1. Event/story data is persistent

- `events.description` and `events.theme_key` are persisted and round-trip through `eventService`.
- Event captions are stored in `captions`.
- Hearts are stored in `media_reactions` and are consumed by the story engine.
- Server-side story generation reads the same captions/reactions as the app preview.
- Migration: `supabase/migrations/007_story_and_guest_flow.sql`.

## 2. Storybook flow uses one identifier

App navigation now opens storybooks by **event id**. The story screen resolves the latest completed database storybook for that event and keeps the real storybook id only for share-link creation. This removes the former event-id/storybook-id mismatch.

The first completed story opens through the cinematic `StoryReadyReveal`. Once dismissed, a realtime database update does not unexpectedly show the reveal again.

## 3. QR / web guest contribution

`/join/[code]` is public and bypasses normal onboarding/auth redirects.

- Native: a guest can enter a name, receive an anonymous Supabase session, join the event, upload media and leave a note.
- Web: the same URL uses a browser-native multi-file picker; no app installation is required.
- Guest uploads use the private `event-media` bucket and create normal `media_assets` rows.
- Database and Storage RLS both reject new contributions after an event is `ended` or `cancelled`.

**Supabase requirement:** Anonymous Sign-Ins must be enabled under Authentication settings for no-account guest contribution.

## 4. Private web story sharing

Organisers create high-entropy, expiring share tokens. `/share/[token]` is public and bypasses normal app auth.

`public-story` is an unauthenticated Edge Function protected by possession of the share token. It uses the service role only server-side and refreshes signed URLs for private event media when a story is opened. This prevents a 30-day story link from containing media URLs that expired after an hour.

Deploy the function:

```bash
supabase functions deploy public-story --no-verify-jwt
```

The SQL fallback `get_shared_story(token)` remains available if the Edge Function is not yet deployed, but it cannot refresh expired media URLs.

Set the public web origin used in QR/share links:

```env
EXPO_PUBLIC_APP_URL=https://your-ambler-domain.example
```

That domain must serve the Ambler Expo web build and route `/join/*` and `/share/*` back to the app entry point.

## 5. Cinematic story reveal

Completed owner stories now open with **YOUR STORY IS READY** → **Relive the story**, using the story cover when available and respecting reduced-motion preferences. Shared web stories use browser-safe story pages: Route Replay has a web renderer and the share/end page does not import native camera-roll or view-shot modules.

## Validation in this checkpoint

- TypeScript/TSX syntax-transpile sweep across the source tree.
- `git diff --check`.
- Full Expo dependency/type/native build still needs to run in a normal project environment because dependency installation in the isolated build container timed out.
