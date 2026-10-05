# Ambler — Architecture

Updated: 2026-10-05

This document explains how the Ambler repository is structured so development can resume without relying on chat history.

## Architectural intent

Ambler is organised around the product flow **Capture → Build → Relive**.

The codebase deliberately separates:
- navigation/screens,
- reusable UI,
- domain services,
- state,
- shared types and styling,
- backend schema/functions,
- product/release documentation.

The repository `russellstokes-ai/Ambler` is the canonical source.

## Top-level structure

### `app/` — product routes

Expo Router owns navigation and user-facing route entry points.

Key groups:
- `app/(auth)/` — welcome, sign-in and profile setup
- `app/(tabs)/` — primary signed-in navigation
- `app/event/create.tsx` — event creation
- `app/event/[id]/lobby.tsx` — event hub
- `app/event/[id]/gallery.tsx` — event moments/gallery
- `app/event/[id]/route.tsx` — route capture/replay entry
- `app/join/[code].tsx` — invite/guest join flow
- `app/storybook/[id].tsx` — Relive storybook
- `app/storybook/edit/[id].tsx` — organiser story editing
- `app/share/[token].tsx` — private browser story
- `app/settings/` — privacy, notifications and product information

Screens should orchestrate product flows. Reusable business logic should stay out of route files where practical.

### `src/components/` — reusable presentation

Organised by responsibility:
- `core/` — buttons, loading, error and resilience primitives
- `event/` — event type/theme/invite UI
- `location/` — consent and route summary UI
- `media/` — media grids, viewer and upload UI
- `onboarding/` — onboarding presentation
- `storybook/` — story generation, reveal, pager and story pages

Story page types include:
- cover/opening
- gallery
- friend captions
- insights
- timeline
- Route Replay
- sharing

Native and web-specific Route Replay/Share implementations use platform file variants where needed.

### `src/features/` — domain/application logic

This is the main product logic layer.

- `auth/` — authentication/session operations
- `events/` — event creation, event types, themes and event persistence
- `contributions/` — guest/member contribution logic
- `media/` — media selection/upload/storage metadata
- `location/` — GPS capture, route types and Route Replay V2 media/scene helpers
- `storybook/` — deterministic story engine, planner, editor and theme engine
- `sharing/` — private links, public story retrieval and export
- `music/` — soundtrack catalogue/player mapping
- `preferences/` — product/user preferences
- `diagnostics/` — local error reporting/scrubbing

Business rules should live here rather than being duplicated in UI screens.

## Story engine

`src/features/storybook/engine/` is intentionally modular.

Core responsibilities:
- `mediaScorer.ts` — media quality/importance scoring
- `curator.ts` — selection/curation
- `timelineBuilder.ts` — chronological/event structure
- `storyPlanner.ts` — Short / Standard / Epic pacing and chapter planning
- `routeProcessor.ts` — route-derived story information
- `insightGenerator.ts` — factual insights only
- `copyGenerator.ts` / `eventStoryContent.ts` — authored deterministic copy
- `themeApplier.ts` — presentation treatment
- `musicSelector.ts` — soundtrack selection
- `qualityScorer.ts` — story quality signals
- `index.ts` — engine composition

The core story engine must remain usable without generative AI.

## Route Replay

Current architecture has two layers:

1. **Current working renderer**
   - React Native Maps baseline
   - progressive route drawing
   - route media moments
   - clustering
   - photo/video viewer integration
   - theme styling
   - reduced-motion support
   - web-safe variant

2. **Approved Route Replay V2 target**
   - adaptive geography treatment
   - terrain/city/town/journey/venue scenes
   - richer cinematic camera treatment
   - preferred Mapbox-based 3D renderer after compatibility verification
   - route-linked group photo/video moments
   - privacy-aware shared rendering
   - polished 2D fallback

`src/features/location/routeReplayV2.ts` already defines scene selection, route media moments and proximity clustering. The complete 3D/adaptive V2 renderer is not yet accepted and remains explicitly tracked in `ROUTE_REPLAY_V2.md` and `ROADMAP.md`.

## State

`src/stores/` contains Zustand application state:
- `authStore.ts`
- `eventStore.ts`
- `locationStore.ts`
- `mediaStore.ts`

Persistent truth belongs in Supabase; stores coordinate client state and UX rather than replacing backend persistence.

## Types and configuration

- `src/types/index.ts` — shared application/story types
- `src/config/supabase.ts` and `src/lib/supabase.ts` — backend client/configuration
- `src/config/links.ts` — public/app links
- `src/styles/theme.ts` — base design tokens
- `src/styles/themePresets.ts` — reusable Ambler story themes

## Backend

Supabase is versioned inside the repository.

### Migrations

`supabase/migrations/` contains ordered schema/security evolution, including:
- initial schema
- RLS policies
- indexes/triggers
- account deletion
- media GPS fields
- story/guest flow
- activity/story editing
- invite/participant hardening

Never bypass the invite-code path for private-event guest membership.

### Edge Functions

- `generate-storybook/` — authenticated organiser-only story generation and persistence
- `public-story/` — token-gated private browser story delivery

Story generation uses service credentials server-side only after authenticating and authorising the organiser.

## Media and privacy model

Media is private event content stored via Supabase Storage.

Important rules:
- use signed URLs for private media delivery
- refresh expired media URLs rather than persisting fragile signed URLs forever
- preserve original/private route data for calculations
- apply start/end privacy redaction to rendered/shared route output
- never pin media without genuine GPS data
- treat video separately from image-only layouts and retain poster/thumbnail metadata

## Guest participation

Guest contribution is a core acquisition/usability path, not a secondary feature.

Expected flow:
1. organiser creates event
2. organiser shares QR/link
3. guest opens join route
4. anonymous/auth session is established as required
5. invite-code RPC grants event membership
6. guest contributes media/notes
7. organiser sees contributions
8. contributions become candidates for the finished story

The direct self-join path is intentionally blocked by RLS hardening.

## Platform strategy

Current shared baseline:
- Expo SDK 52
- React Native 0.76
- TypeScript
- Android native project present
- web story/share surfaces supported
- iOS remains part of the cross-platform product direction

Do not perform a large mapping/native architecture migration merely to gain 3D maps. Route Replay V2 should be introduced in staged, build-verified steps.

## Assets

- `assets/brand/` — Ambler app/brand assets
- `assets/music/` — soundtrack documentation and licensing manifest

No production soundtrack should ship without confirmed rights recorded in the manifest.

## CI and verification

GitHub workflows:
- `.github/workflows/ci.yml`
- `.github/workflows/release-readiness.yml`

Source presence is not equivalent to verification.

Status vocabulary:
- **Implemented** — source exists and is wired
- **Verified** — tests/build/runtime prove it
- **Accepted** — intended end-to-end product flow passes acceptance criteria

## Documentation hierarchy

When there is ambiguity, use this order:

1. `CURRENT_STATE.md` — current factual status
2. `PRODUCT_PLAN.md` — product scope
3. `ROADMAP.md` — forward execution
4. `PRODUCT_DIRECTION.md` — conceptual guardrails
5. `PRODUCT_ACCEPTANCE_CRITERIA.md` — acceptance gates
6. `ROUTE_REPLAY_V2.md` — headline route specification
7. `ARCHITECTURE.md` — code/system structure
8. specialist documents such as story/content, events, copy, deployment and release docs

Historical sprint documents are useful implementation records but should not override newer canonical planning documents.

## Resume rule

A future developer/agent should be able to resume from GitHub alone.

Start by reading:
- `README.md`
- `docs/CURRENT_STATE.md`
- `docs/PRODUCT_PLAN.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`

Then inspect the latest commit and CI status before changing code.
