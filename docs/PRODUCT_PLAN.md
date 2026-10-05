# Ambler — Product Plan

Updated: 2026-10-05

This is the canonical product plan for Ambler. It turns the approved product direction into a single build-and-release reference. Detailed implementation and acceptance documents remain authoritative where linked.

## Product promise

Ambler turns a shared event, trip or activity into a private, cinematic story built from the group's photos, videos, notes, route and real captured signals.

The product model is **Capture → Build → Relive**.

The finished story — not the shared album — is the product.

## Target experience

### Capture
- create an event quickly
- choose from a curated set of event types while retaining the full catalogue
- invite people by QR/link
- let guests contribute without installing the app
- collect photos, videos, notes and optional route data
- keep events private by default
- make errors recoverable and contributions visible as they arrive

### Build
- curate deterministically first
- score and select media
- build timeline/chapters from real event signals
- use route, time, place and media bursts where useful
- support Short / Standard / Epic story pacing
- derive only factual insights from captured data
- choose story family, theme and soundtrack treatment
- generate a complete story before asking the organiser to edit
- keep generative AI optional, never required

### Relive
- open through the cinematic Story Ready reveal
- swipe/watch through a polished storybook
- make Route Replay a headline storytelling surface
- show route-linked group photos and videos at their real locations
- share privately with an expiring/revocable browser link
- retain export/print foundations
- provide a subtle path to create the next Ambler story

## Core product principles

1. **Private by default.**
2. **Low-friction contribution.** Guests should not need an app install for normal contribution.
3. **No invented memories.** Never invent memories, emotions, quotes, scores, places, health data or activity statistics.
4. **Deterministic core.** Core story creation must work without generative AI.
5. **Group-first storytelling.** Contributions from all participants should materially shape the finished story.
6. **Finished product quality.** No dead controls, placeholder copy, prototype labels or misleading success states.
7. **Persistence and recovery.** State must survive return/relaunch and failures must be recoverable.
8. **Accessibility.** Reduced-motion and graceful fallbacks must preserve the experience.

## Product scope

### In scope for the first owner-test product
- account/auth and guest invite flows
- event creation and management
- 52 event types / 14 narrative families
- guest QR/link contribution
- photo/video upload and notes
- private event gallery
- optional GPS route capture
- story generation and editing
- Story Ready reveal
- private browser sharing
- Route Replay V2
- event/account privacy, moderation and deletion
- Android release candidate, web share experience and iOS-compatible shared code
- production-quality empty/loading/error states
- test/build/release gates defined in `PRODUCT_ACCEPTANCE_CRITERIA.md`

### Explicitly not the product
- generic shared photo album
- group chat
- ticketing, payments or RSVP platform
- seating planner
- AI-generated fictional memories
- public social network

## Headline feature: Route Replay V2

Route Replay must feel like an Ambler story rather than an embedded navigation map.

Final requirements are defined in `ROUTE_REPLAY_V2.md`, including:
- adaptive terrain/city/town/road-trip/venue treatments
- progressive route animation
- context-aware camera movement
- route-linked group photos and videos
- clustering and tap-to-view playback
- preservation of replay progress
- theme-aware styling
- reduced-motion support
- private/shared route redaction
- rich web renderer with graceful fallback
- physical-device verification

Preferred rich-renderer direction is Mapbox-based 3D terrain/buildings/lighting, subject to a deliberate native compatibility migration and verification plan. The current source does not yet prove the complete V2 experience.

## Story/content system

Ambler uses reusable narrative families rather than a bespoke engine per event type. Current direction includes 52 event types across families such as:
- party / night out
- birthday
- wedding / engagement
- family / sentimental
- trip / holiday
- road trip / journey
- hiking / trekking
- sport / match day
- fitness / group workout
- festival / concert
- day out / theme park
- celebration / graduation
- corporate / team
- general / custom

Themes remain reusable and interchangeable.

## Technology baseline

Current repository baseline:
- Expo Router
- React Native
- TypeScript
- Supabase Auth / Postgres / Storage / RLS / Realtime / Edge Functions
- React Native Maps for the current mapping baseline
- GitHub Actions for source/type/build verification

The repository is the source of truth: `russellstokes-ai/Ambler`.

## Quality bar

A feature is complete only when the user can:
1. discover it,
2. understand it,
3. use it,
4. recover from failure,
5. return later and find the state persisted,
6. get the intended end-to-end result.

The first owner test must feel like a product, not a scaffold.

## Release gates

Before an owner-test build:
- re-verify the fine-tooth audit in `CURRENT_STATE.md`
- generate and commit a clean verified lockfile
- source/backend/story-engine tests pass
- TypeScript passes
- web export passes
- Android debug and release builds pass
- Route Replay V2 acceptance criteria pass
- physical-device smoke testing passes
- logged-out private web sharing passes
- sparse and awkward story cases degrade gracefully
- no unlicensed soundtrack assets ship

## Canonical supporting documents

Read together with:
- `CURRENT_STATE.md` — present truth and known verification gaps
- `ROADMAP.md` — remaining execution sequence
- `PRODUCT_DIRECTION.md` — approved product direction and guardrails
- `PRODUCT_ACCEPTANCE_CRITERIA.md` — owner-test gates
- `ROUTE_REPLAY_V2.md` — final Route Replay specification
- `AMBLER_JOBS_1_5.md` and `AMBLER_JOBS_6_15.md` — historical sprint implementation checkpoints
- `RELEASE_CHECKLIST.md` — deployment/release gate
