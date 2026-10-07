# Ambler — Product Roadmap

Updated: 2026-10-07

This is the canonical forward roadmap. Historical sprint implementation detail is retained in `AMBLER_JOBS_1_5.md` and `AMBLER_JOBS_6_15.md`; this file describes what still has to be proven or completed before Ambler is treated as a finished owner-test product.

## Status summary

The repository contains the broad Capture → Build → Relive product baseline and the source work recorded for Jobs 1–15.

Do **not** interpret that as “15/15 commercially finished”. Source presence and sprint completion are different from verified product acceptance.

The current priority is verification, Route Replay V2 completion, whole-flow polish and physical-device proof.

## Phase 0 — Draftbit UI lock

Goal: validate Ambler's product structure visually before the remaining major engineering work.

The canonical design specifications are in `docs/ui/`.

Specification status:
- [x] Sprint 0 — UI blueprint and 36-screen inventory specified
- [x] Sprint 1 — design system and app shell specified
- [x] Sprint 2 — onboarding/auth specified
- [x] Sprint 3 — Home/Stories Library specified
- [x] Sprint 4 — Create Event/Live Event Hub specified
- [x] Sprint 5 — Capture/guest contribution specified
- [x] Sprint 6 — Build/Relive specified
- [x] Sprint 7 — Route Replay V2/edit/share specified
- [x] Sprint 8 — self-hosting/settings/UI test gate specified
- [ ] build the specified screens/interactions in Draftbit
- [ ] populate realistic prototype data
- [ ] complete organiser, guest, route, edit/share and self-hosting prototype journeys
- [ ] verify compact-phone layout
- [ ] verify fold-open layout
- [ ] owner UI test
- [ ] record corrections in `docs/ui/`
- [ ] lock approved major layouts/interactions

Exit gate: the Draftbit prototype can navigate the full product without dead ends, major layouts are owner-approved, and remaining feedback is refinement rather than structural redesign.

## Phase 1 — Baseline build and repository proof

Goal: prove the current source is reproducible and healthy.

- [ ] perform a clean networked dependency install
- [ ] generate and commit a verified lockfile
- [ ] run `npm test`
- [ ] run TypeScript typecheck
- [ ] run production-asset validation
- [ ] complete web export
- [ ] run Android debug build
- [ ] run Android release build
- [ ] verify backend migrations/functions against the intended Supabase project
- [ ] review CI results and remove any stale/duplicate workflow failure causes

Exit gate: a clean checkout can build and test without relying on an old local/VPS state.

## Phase 2 — Fine-tooth functional verification

Goal: convert implemented-looking features into proven end-to-end behaviour.

Re-verify all items in `CURRENT_STATE.md`, with emphasis on:
- [ ] event creation and participant RLS
- [ ] invalid date/time resilience
- [ ] organiser navigation to Moments and Route Replay
- [ ] real participant contribution counts
- [ ] image/video rendering correctness
- [ ] signed URL refresh for old stories
- [ ] idempotent story-generation retry
- [ ] recoverable generation failure
- [ ] live contribution refresh
- [ ] anonymous invite/session edge cases
- [ ] closed-event affordances
- [ ] direct camera contribution
- [ ] curated Popular event picker
- [ ] real legal/privacy screens
- [ ] accurate route stats plus render-time privacy redaction
- [ ] stale invite closure
- [ ] profile/event editing
- [ ] native-safe vs web-safe public sharing
- [ ] share link revocation/reuse
- [ ] explicit production map configuration
- [ ] graceful no-media / one-photo / video-only / route-only / mixed-media stories
- [ ] removal of dead controls and unfinished surfaces

Exit gate: the core flow can be completed repeatedly without hidden blockers.

## Phase 3 — Route Replay V2

Goal: deliver the approved headline experience rather than a generic embedded map.

### 3A. Route/media data contract
- [ ] normalise route-linked media model
- [ ] retain real media GPS/timestamp/contributor data
- [ ] generate/retrieve real video posters
- [ ] keep non-geotagged media unpinned

### 3B. Media moments and clustering
- [ ] place group photos/videos along the route
- [ ] cluster nearby media
- [ ] open cluster/media viewer
- [ ] photo full-screen treatment
- [ ] video playback with poster and controls
- [ ] swipe within a stop/cluster
- [ ] return without losing replay progress

### 3C. Polished adaptive 2D baseline
- [ ] progressive route drawing
- [ ] context-aware camera sections
- [ ] event/theme styling
- [ ] pause/scrub/skip/explore controls
- [ ] reduced-motion behaviour
- [ ] private/shared route redaction

### 3D. Rich 3D renderer
- [ ] complete Mapbox/native compatibility spike
- [ ] choose verified migration path
- [ ] terrain/elevation treatment
- [ ] city buildings/landmarks treatment
- [ ] town/village simplified treatment
- [ ] road-trip wide progression
- [ ] venue/festival/theme-park clustered treatment
- [ ] Android physical-device verification
- [ ] iOS release-build verification

### 3E. Shared web replay
- [ ] rich WebGL renderer where supported
- [ ] lightweight polished fallback
- [ ] logged-out private-link verification

Exit gate: every acceptance criterion in `ROUTE_REPLAY_V2.md` passes.

## Phase 4 — Whole-product UX polish

Goal: make the first test feel commercially coherent.

- [ ] audit onboarding and first launch
- [ ] verify all empty/loading/error states
- [ ] remove prototype/developer wording
- [ ] confirm button/icon/layout consistency
- [ ] verify foldable/resizable layouts
- [ ] verify reduced-motion accessibility
- [ ] tune Story Ready reveal
- [ ] tune story pager, video pages and editing interactions
- [ ] make recovery paths obvious rather than technical
- [ ] review copy against `COPY_GUIDE.md`

Exit gate: no screen presented to the user feels like scaffolding.

## Phase 5 — Physical-device and browser acceptance

Goal: prove the complete user journey outside source-level tests.

Test on real devices and a logged-out browser:
- [ ] create an event
- [ ] join by QR/link
- [ ] contribute photos
- [ ] contribute videos
- [ ] add notes
- [ ] record/use route where applicable
- [ ] end event and generate story
- [ ] recover from forced generation/network failure
- [ ] relaunch and confirm state persistence
- [ ] edit story
- [ ] play videos
- [ ] use Route Replay
- [ ] share privately
- [ ] revoke/expire link
- [ ] archive/delete event
- [ ] verify storage cleanup/privacy

Also deliberately test:
- [ ] no media
- [ ] one photo
- [ ] video only
- [ ] route only
- [ ] mixed media
- [ ] sparse GPS
- [ ] dense GPS
- [ ] revoked share
- [ ] stale invite
- [ ] poor/no network

Exit gate: `PRODUCT_ACCEPTANCE_CRITERIA.md` passes end-to-end.

## Phase 6 — Owner-test release candidate

Goal: produce the first build that is worth judging as a product.

- [ ] complete `RELEASE_CHECKLIST.md`
- [ ] confirm no unlicensed soundtrack assets ship
- [ ] freeze release candidate commit
- [ ] generate installable Android test build
- [ ] capture release notes and known limitations
- [ ] owner test
- [ ] triage findings into small follow-up sprints

## After owner test

Only after the core experience is proven:
- soundtrack pack/licensing expansion
- deeper print/physical-book output
- broader event intelligence
- optional generative prose polish
- additional social/family sharing refinements
- further platform-specific distribution work

## Rule for sprint status

Use these labels consistently:
- **Implemented** — source path exists and is wired.
- **Verified** — tests/build/runtime behaviour confirm it.
- **Accepted** — it passes the product acceptance criteria in the intended user flow.

Do not mark a roadmap item complete merely because the UI or source file exists.
