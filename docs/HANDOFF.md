# Ambler — Handoff / Resume Guide

Use this file first when returning to the project.

## Canonical repository

Repository: `russellstokes-ai/Ambler`

GitHub is the source of truth. Do not restart from an old VPS copy or old chat ZIP unless the repository is unavailable.

## Read in this order

1. `docs/CURRENT_STATE.md`
2. `docs/PRODUCT_DIRECTION.md`
3. `docs/PRODUCT_ACCEPTANCE_CRITERIA.md`
4. `docs/ROUTE_REPLAY_V2.md`
5. `docs/RELEASE_CHECKLIST.md`
6. latest git log / working tree status

## Product principle

**Capture → Build → Relive**

The finished story is the product. The shared album is supporting infrastructure.

Guest contribution should feel nearly frictionless. Story generation should work without generative AI and must never invent memories, quotes, scores, places or activity data.

## Development principle

Work in small, reviewable sprints.

For every sprint:
- preserve the approved product/UI direction
- wire the complete end-to-end behaviour, not just the screen
- update tests where practical
- update docs when a decision changes
- do not mark native/build/backend behaviour complete without verification

## Immediate resume sequence

1. inspect latest commit and CI state
2. run the existing source/backend/story-engine test suites
3. install dependencies on a networked machine and commit a verified lockfile
4. run TypeScript/typecheck and web export
5. re-audit the fine-tooth items in `CURRENT_STATE.md`
6. implement Route Replay V2 as a deliberate mapping/native sprint
7. run Android + iOS/web release builds
8. perform physical-device and logged-out-browser end-to-end testing
9. only then produce the first owner-test build

## Route Replay implementation rule

Do not replace the current route renderer with an unverified dependency upgrade in one bulk change.

Implement in stages:

1. data contract for route-linked media
2. route media clustering and tap-to-view behaviour
3. polished 2D adaptive renderer
4. 3D mapping/native compatibility spike
5. 3D terrain/city renderer
6. web rich renderer + lightweight fallback
7. physical-device performance/privacy verification

The final visual direction is defined in `ROUTE_REPLAY_V2.md`.

## Product non-negotiables

- finished story is the core product
- private by default
- guest contribution remains low friction
- core story creation does not require generative AI
- never invent memories, quotes, scores or health/activity data
- group photos and videos meaningfully shape the finished story
- route-linked group media is tappable and playable
- UI must feel finished; hide incomplete features rather than advertising placeholders
- errors must be recoverable and clearly explained
- release builds must be tested, not inferred from source
