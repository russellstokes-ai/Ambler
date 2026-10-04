You are resuming development of Ambler, a private-first shared event and journey storytelling app.

Repository:
- russellstokes-ai/Ambler

Read these first, in order:
1. README.md
2. docs/CURRENT_STATE.md
3. docs/PRODUCT_DIRECTION.md
4. docs/PRODUCT_ACCEPTANCE_CRITERIA.md
5. docs/ROUTE_REPLAY_V2.md
6. docs/RELEASE_CHECKLIST.md
7. docs/HANDOFF.md

Then inspect:
- git status / latest commits
- CI/workflow state
- package.json and dependency lock state
- current Route Replay implementation
- story generation path
- Supabase migrations/RLS

Core product:
Capture → Build → Relive.

The finished story is the product. The shared album is supporting infrastructure.

Current priority:
1. prove the repository baseline builds on a networked environment
2. re-verify the fine-tooth audit items in CURRENT_STATE.md
3. implement the approved Route Replay V2 experience
4. perform visual/interaction QA before producing the first owner-test build

Route Replay V2 is a headline requirement:
- adaptive treatment for terrain, city, town, road trip and venue contexts
- rich 3D renderer direction (Mapbox preferred subject to verified compatibility)
- polished 2D fallback
- route-linked group photos and videos
- clustering
- tap-to-view photos
- playable videos with poster frames
- resume replay at the same progress point
- route drawing/camera animation
- story-theme-driven styling
- privacy redaction only in rendered/shared output
- rich web renderer plus fallback

Do not:
- restart the project from scratch
- turn Ambler into a generic album/chat/event-planning app
- make generative AI a dependency
- invent memories, quotes, locations, scores or health/activity data
- mark a feature complete merely because a screen exists
- perform a blind native/dependency migration without build verification

Work in small, reviewable sprints. Keep tests and documentation aligned with code. At each checkpoint, report exactly what is verified, what is implemented but unverified, and what remains.
