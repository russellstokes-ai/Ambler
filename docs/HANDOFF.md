# Ambler — Handoff / Resume Guide

Use this file first when returning to the project.

## Canonical repository

Target repository: `russellstokes-ai/Ambler`

The repository must become the source of truth. Do not resume development from an old VPS copy or an old chat ZIP once the current source has been pushed.

## Read in this order

1. `docs/CURRENT_STATE.md`
2. `docs/PRODUCT_ACCEPTANCE_CRITERIA.md`
3. `docs/ROUTE_REPLAY_V2.md`
4. `docs/RELEASE_CHECKLIST.md`
5. latest git log / working tree status

## Development principle

Work in small, reviewable sprints. Keep product behaviour, tests and documentation updated in the same sprint.

Do not mark unverified native/build/backend behaviour complete.

## Immediate resume sequence

1. run `npm test`
2. install dependencies on a networked machine and generate/commit a verified lockfile
3. run `npm run typecheck`
4. re-audit/re-apply the items in `CURRENT_STATE.md`
5. implement Route Replay V2 compatibility migration and renderer
6. run Android + web release builds
7. perform physical-device and logged-out browser end-to-end testing

## Product non-negotiables

- finished story is the core product
- guest contribution must remain very low friction
- core story creation must not depend on generative AI
- never invent memories, quotes, scores or health/activity data
- private by default
- photos and videos from the group should meaningfully shape the finished story
- UI should feel finished; hide incomplete features rather than advertising placeholders
