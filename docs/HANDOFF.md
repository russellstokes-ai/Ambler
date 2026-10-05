# Ambler — Handoff / Resume Guide

Use this file first when returning to the project.

## Canonical repository

Repository: `russellstokes-ai/Ambler`

GitHub is the source of truth. Do not restart from an old VPS copy or old chat ZIP unless the repository is unavailable.

## Read in this order

1. `docs/CURRENT_STATE.md`
2. `docs/PRODUCT_PLAN.md`
3. `docs/ROADMAP.md`
4. `docs/PRODUCT_DIRECTION.md`
5. `docs/PRODUCT_ACCEPTANCE_CRITERIA.md`
6. `docs/ROUTE_REPLAY_V2.md`
7. `docs/RELEASE_CHECKLIST.md`
8. latest git log / CI state

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
- update `ROADMAP.md` when status materially changes
- do not mark native/build/backend behaviour complete without verification

Use the status meanings in `ROADMAP.md`:
- **Implemented** — source path exists and is wired
- **Verified** — tests/build/runtime behaviour confirm it
- **Accepted** — it passes the intended end-to-end product acceptance criteria

## Immediate resume sequence

Follow `ROADMAP.md` in order:

1. prove the repository builds cleanly from a fresh networked checkout
2. re-run source/backend/story-engine/type/build verification
3. re-audit the fine-tooth items in `CURRENT_STATE.md`
4. complete Route Replay V2 deliberately
5. polish the whole first-run and Relive experience
6. run physical-device and logged-out-browser end-to-end testing
7. only then produce the first owner-test build

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
