# Ambler UI — First Draft Build

Updated: 2026-10-07
Branch: `ui/draftbit-first-pass`
Draft PR: #1

## Status

The first-draft Ambler UI has been implemented as an isolated prototype layer in the Expo/React Native repository.

This is intentionally **not merged into production main**. It exists to provide a real, navigable visual baseline for Draftbit recreation and owner UI review.

## Entry point

Open:

`/ui-preview`

This displays the complete 36-screen review index.

Each primary screen is also directly addressable under:

`/ui-preview/<screen-id>`

Examples:
- `/ui-preview/home`
- `/ui-preview/event-hub`
- `/ui-preview/relive`
- `/ui-preview/route-replay`
- `/ui-preview/storage-hosting`

The prototype routes bypass the normal auth guard only on this UI review branch.

## Implemented first-draft surfaces

All 36 primary UI surfaces from the canonical UI blueprint are represented:

- entry/onboarding/auth
- Home/Events/Stories/Archive
- event creation
- live Event Hub
- Moments/Add Moment/Route Capture
- guest join/contribution/result
- Build/Generation/Story Ready/Relive
- Route Replay V2/Route Moment viewer
- Story Editor/Theme & Music/Share/Web Story
- Profile/Settings/Privacy
- Storage & Hosting/Add Server/Server Detail

## Shared visual system

Prototype code:
- `src/ui-prototype/kit.tsx`
- `src/ui-prototype/data.ts`
- `src/ui-prototype/screens.tsx`

The first draft uses:
- Ambler violet / night / ink brand base
- restrained pink/aqua accents
- calmer app shell with more expressive story surfaces
- 4dp spacing logic
- strong hierarchy rather than generic card stacking
- responsive two-pane composition where appropriate
- realistic mock events and story/storage states
- phone/Fold-aware layout primitives
- dark cinematic Relive and Route Replay surfaces

## Five prototype journeys

The implementation contains the intended path for:

1. Organiser:
   Home → Create → Type → Style → Privacy → Invite → Event Hub → Add Moment → Finish → Generate → Story Ready → Relive

2. Guest:
   Guest Join → Contribution → Result

3. Route:
   Event Hub → Route Capture → Relive → Route Replay → Route Moment → Resume

4. Edit/share:
   Relive → Story Editor → Theme/Music → Share → Shared Web Story

5. Self-hosting:
   Profile → Storage & Hosting → Add Server → Server Detail

## Quality rules applied

Lessons carried from Archivist:
- prototype is isolated from production behavior
- existing product UI is not overwritten
- screen presence is not claimed as acceptance
- errors/progress/offline/server states are represented conceptually
- no mandatory server setup
- no fake pinned route media
- responsive layout is intentional rather than stretched
- no build success claim until CI proves it

## Verification status

At the time this document was created:
- dependency install: passed in CI
- Expo dependency compatibility check: passed
- source integrity: passed
- story-engine tests: passed
- TypeScript typecheck: passed
- web export: pending
- Android debug build: pending

Update this document only with evidence from CI/runtime testing.

## Next UI step

After web and Android build verification:
1. open the prototype on phone and Fold layouts
2. review every major screen visually
3. record owner corrections
4. recreate/implement accepted screen structure in Draftbit
5. update `docs/ui/` with accepted changes
6. lock major UI before resuming deep engineering
