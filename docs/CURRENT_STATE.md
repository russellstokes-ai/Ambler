# Ambler — Current State

Updated: 2026-10-04

This file is the canonical short status for returning to Ambler after a break.

## Product promise

Ambler is a private-first shared event and journey storytelling app built around **Capture → Build → Relive**.

The finished story — not the shared album — is the product.

## What is already in the recovered release-candidate baseline

- Expo Router / React Native / TypeScript application
- Supabase authentication, database, storage, realtime and Edge Functions
- event creation, event type and theme system
- 52 event types / 14 narrative families
- browser guest joining by QR/link
- guest photo/video contribution and notes
- private event media gallery
- optional foreground route capture
- deterministic story engine and storybook generation
- story-ready reveal
- story editing and private token sharing
- browser-safe public story route
- activity/story metrics from real captured data
- export foundations
- privacy and deletion controls
- source, backend and deterministic story-engine test scripts

## Important truth about Route Replay

The recovered build does **not** yet implement the final approved Route Replay experience.

Current native Route Replay uses `react-native-maps`. Current public-web Route Replay uses a simplified SVG route renderer.

The final accepted experience is specified in `ROUTE_REPLAY_V2.md` and is a release requirement, not a future idea.

## Audit items that must be re-verified/re-applied

A later fine-tooth-comb audit found issues after the last packaged release candidate. The transient audit workspace was not preserved, so these items must be checked against source and re-applied deliberately:

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
- Android production mapping configuration must be explicit

## Release philosophy

Do not mark a capability complete because a screen exists. A feature is complete only when the user can discover it, use it, recover from errors, and get the expected persisted result end-to-end.
