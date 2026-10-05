# Ambler — Current State

Updated: 2026-10-05

This file is the canonical short status for returning to Ambler after a break.

## Product promise

Ambler is a private-first shared event and journey storytelling app built around **Capture → Build → Relive**.

The finished story — not the shared album — is the product.

## Canonical source

The GitHub repository `russellstokes-ai/Ambler` contains the application source and documentation and should be treated as the source of truth.

Do not resume from an old VPS copy or an old chat ZIP unless recovery from GitHub is impossible.

## Canonical planning set

Use these documents together:

- `docs/PRODUCT_PLAN.md` — what Ambler is and what the first owner-test product must contain
- `docs/ROADMAP.md` — forward execution and verification sequence
- `docs/PRODUCT_DIRECTION.md` — approved product direction and non-negotiables
- `docs/PRODUCT_ACCEPTANCE_CRITERIA.md` — owner-test gates
- `docs/ROUTE_REPLAY_V2.md` — final headline Route Replay requirement
- `docs/RELEASE_CHECKLIST.md` — release/deployment gates

Historical sprint implementation checkpoints remain in `AMBLER_JOBS_1_5.md` and `AMBLER_JOBS_6_15.md`.

## What is already represented in the repository baseline

- Expo Router / React Native / TypeScript application
- Supabase authentication, database, storage, realtime and Edge Functions
- event creation, event type and theme system
- 52 event types / 14 narrative families
- browser guest joining by QR/link
- guest photo/video contribution and notes
- private event media gallery
- optional route capture
- deterministic story engine and storybook generation
- Story Ready reveal
- story editing and private token sharing
- browser-safe public story route
- activity/story metrics from real captured data
- export foundations
- privacy and deletion controls
- source, backend and deterministic story-engine test scripts

## Recent integrity fixes

- 2026-10-05: added a canonical architecture map so future work can resume from GitHub alone.
- 2026-10-05: fixed the server-side story generator to carry `media_assets.gps_lat/gps_lng` into the deterministic story engine, preserving the Route Replay V2 requirement that geotagged group photos/videos can become real route moments.

## Sprint-status truth

The repository contains the source work recorded for Jobs 1–15, but that does **not** mean the product is 15/15 accepted.

Treat status as:
- **Implemented** when the source path exists and is wired
- **Verified** when tests/build/runtime behaviour confirm it
- **Accepted** only when the intended end-to-end user flow passes

The remaining sequence is maintained in `docs/ROADMAP.md`.

## Approved final product direction

The latest product direction is captured in:

- `docs/PRODUCT_PLAN.md`
- `docs/PRODUCT_DIRECTION.md`
- `docs/PRODUCT_ACCEPTANCE_CRITERIA.md`
- `docs/ROUTE_REPLAY_V2.md`

These are requirements for the final product, not optional inspiration.

### Route Replay headline experience

The finished Route Replay should not look like an embedded navigation map.

It should adapt to context:

- mountains / hiking: 3D terrain, elevation, cinematic camera
- city: 3D buildings / landmarks, lower oblique camera, themed lighting
- town / village: simplified urban treatment with route/media emphasis
- road trip: wider progression between places
- venue / festival / theme park: tighter route and media clustering

Preferred direction is a Mapbox-based rich renderer for the Relive experience, subject to a verified compatibility/native migration plan. Live capture/navigation can continue to use the most practical native map implementation.

All group members' geotagged photos and videos should appear as route moments where appropriate, including clustering, thumbnails/posters, tap-to-view playback and preservation of replay progress.

## Important truth about the current Route Replay

The current source does **not** yet prove the complete final Route Replay V2 experience.

The final accepted experience is specified in `ROUTE_REPLAY_V2.md` and remains a release requirement.

Do not mark it complete until the 3D/adaptive renderer, group media moments, clustering, playback and physical-device verification have all passed.

## Fine-tooth audit items to verify before first owner test

A previous audit identified issues that should be re-verified against the current source rather than assumed fixed:

- event creation / participant RLS correctness
- invalid date/time input must never crash creation
- organiser event hub navigation to Moments and Route Replay
- participant contribution counts must be real
- video playback in gallery/story pages
- video media must never enter image-only layouts without a thumbnail
- old saved stories must refresh expired signed media URLs
- story-generation retries must be idempotent
- failed story generation must not strand an event in an unusable ended state
- production generator must not silently fall back to a weaker story engine
- live gallery/lobby refresh for new guest contributions
- invite/auth anonymous-session edge cases
- closed events must not display upload affordances
- direct camera contribution path
- event picker should lead with a curated Popular set, not all 52 types
- legal/privacy links must be real screens
- route stats must use accurate private route data; privacy redaction belongs in rendered/shared output
- stale invites must stop accepting joins/contributions after closure
- event/profile everyday editing controls must be present
- public web share must not import native-only APIs
- share links must be revocable/reused appropriately
- Android/iOS production mapping configuration must be explicit
- zero-media, one-photo, video-only, route-only and mixed-media stories must degrade gracefully
- no dead controls, placeholder labels or consumer-facing unfinished surfaces

## Release philosophy

Do not mark a capability complete because a screen exists.

A feature is complete only when the user can:
1. discover it,
2. understand it,
3. use it,
4. recover from failure,
5. return later and find the state persisted,
6. get the expected end-to-end result.

The first owner test should feel like a product, not a scaffold.
