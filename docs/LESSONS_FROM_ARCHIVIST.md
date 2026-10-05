# Ambler — Lessons Carried Forward from Archivist

Updated: 2026-10-05

This document captures practical lessons learned while building and testing Archivist so Ambler does not repeat the same product, architecture, UI, build, and verification mistakes.

It is a required reference for Ambler development, particularly before major UI, native, media, background-processing, self-hosting, and release work.

## Core development rules

### 1. GitHub is the source of truth

Do not allow development to drift between:
- local copies
- old ZIPs
- old branches
- Draftbit exports
- temporary folders
- previous chat-generated copies

Draftbit may be used for visual/product prototyping, but approved product decisions and final implementation must be reflected in GitHub.

### 2. A screen is not a feature

Do not call a feature complete because:
- a page exists
- a button exists
- a mock state renders
- a service method exists
- a component is wired superficially

A feature is only **implemented** when its actual end-to-end path exists.

Use the Ambler status vocabulary:
- **Implemented** — source path exists and is wired
- **Verified** — tests/build/runtime prove the intended behaviour
- **Accepted** — the intended end-to-end product experience passes acceptance

### 3. Do not mark untested work complete

Archivist repeatedly exposed gaps when source-level assumptions were treated as proof.

For Ambler:
- build results must come from builds
- runtime claims must come from runtime tests
- persistence claims must be tested across restart
- native behaviour must be verified on native devices
- web behaviour must be verified in a browser
- cross-platform behaviour must not be inferred from one platform

### 4. Lock major UI before heavy engineering

Major Ambler product surfaces should be designed and reviewed before implementing deep native or backend behaviour.

Preferred sequence:
1. product concept
2. UI flows
3. Draftbit prototype
4. UI testing
5. lock major layouts/interactions
6. implement in small sprints
7. verify each sprint
8. physical-device testing
9. final polish
10. release candidate

Once a major screen is approved, unrelated engineering work must not casually rearrange it.

### 5. Avoid generic UI

Archivist repeatedly drifted toward generic boxes/cards.

Ambler UI should be deliberately composed:
- clear hierarchy
- consistent spacing
- intentional typography
- consistent icons
- purposeful motion
- responsive composition
- polished empty/loading/error states
- restrained use of cards

Do not solve every information problem with another rounded rectangle.

### 6. Test real device geometry early

Check:
- phone portrait
- phone landscape where relevant
- foldable closed
- foldable open
- tablet/wide layouts
- safe areas
- status/navigation bars
- keyboard interaction
- long labels
- clipping
- fixed bottom controls
- modal/sheet positioning

Responsive layouts must be designed, not merely stretched.

### 7. Animation is product behaviour

Poor motion can make correct UI feel broken.

For Ambler:
- route animation
- story reveal
- story page transitions
- media expansion
- cluster expansion
- loading transitions
- progress movement

must be treated as interaction design, with reduced-motion alternatives.

### 8. Build infrastructure first enough to trust it

Before major feature work:
- clean install must work
- lockfile must be valid
- TypeScript must pass
- CI must be meaningful
- web export must be verified
- Android builds must be reproducible
- native dependencies must match the supported stack

Do not build major features on top of an unproven dependency state.

### 9. Native dependency changes must be staged

Archivist showed the cost of changing platform foundations while feature work was underway.

For Ambler Route Replay V2:
- do not replace the mapping stack in one large change
- prove compatibility first
- preserve a working fallback
- make migration reversible
- verify builds after each dependency/native step

### 10. Keep sprints small and reviewable

Avoid bulk “fix everything” passes.

A good Ambler sprint should:
- have a narrow goal
- preserve approved UI
- identify files touched
- include verification
- update documentation if behaviour/architecture changes

## Background work and responsiveness

### 11. Long-running jobs must never freeze the UI

Archivist's metadata scanner hanging the app is a key lesson.

Any Ambler long-running task must:
- run without blocking the UI thread
- expose meaningful progress
- support recovery/retry
- avoid duplicate work
- survive interruption where practical
- keep navigation responsive

Relevant Ambler examples:
- story generation
- large media upload
- local server sync
- story archive/migration
- export
- route processing
- thumbnail generation

### 12. Progress must reflect real work

Avoid meaningless indefinite spinners where a real phase or percentage is available.

Good progress states include:
- preparing
- uploading
- processing
- building story
- saving
- syncing
- finalising

Progress should not claim completion before persistence is complete.

### 13. Failures must be recoverable

Every significant background operation should answer:
- what failed?
- what was already saved?
- can the user retry safely?
- will retry duplicate anything?
- can the app resume from the last safe point?

## Media lessons

### 14. Media edge cases are first-class

Test:
- missing thumbnails
- corrupted files
- very large files
- unusual aspect ratios
- portrait/landscape mixtures
- video-only events
- photo-only events
- one-item events
- sparse events
- hundreds of items
- media without GPS
- media with inaccurate GPS
- duplicate uploads

### 15. Video is not a photo with a play icon

Video needs:
- reliable poster/thumbnail
- duration
- proper playback state
- loading/failure state
- resume behaviour where appropriate
- correct inclusion/exclusion from image-only layouts

### 16. Never invent metadata

Archivist metadata issues reinforced this rule.

Ambler must never fabricate:
- GPS location
- participant identity
- timestamps
- quotes
- route points
- activity metrics
- scores presented as factual
- health/fitness data

Unknown data must remain unknown.

### 17. Signed/private media URLs are temporary

Do not persist fragile signed URLs as permanent media identity.

Store stable references and refresh signed URLs when required.

## Persistence and data integrity

### 18. Persistence must be explicitly tested

Check that:
- stories reopen after app restart
- events survive restart
- drafts survive restart where intended
- route data survives restart
- selected themes/settings survive restart
- server sync state survives restart
- private share settings survive restart

Do not infer persistence because state appears correct during one session.

### 19. Data operations should be safe by default

For destructive or transformative operations:
- preview where practical
- confirm destructive actions
- use idempotent operations
- support retry
- maintain integrity if interrupted

Account deletion, event deletion, archive cleanup, server migration, and media cleanup require special care.

## Self-hosting / server lessons

### 20. Server use must remain optional

Archivist showed that requiring server setup too early creates friction.

Ambler must:
- work normally without a local server
- allow server connection later
- avoid blocking first-run experience
- keep cloud/device/server concepts understandable

### 21. Do not expose infrastructure complexity unnecessarily

Avoid:
- mandatory API-key-first screens
- raw filesystem paths as the primary UX
- technical terminology where a user-facing concept exists
- manual configuration when discovery/QR can work

Preferred Ambler local-server UX:
- discover server
- scan server QR
- connect
- show status
- choose what to store
- sync in background

### 22. Server unavailability must degrade gracefully

If a user's Ambler Home Server is offline:
- stories should remain usable where cached/local
- new work should not disappear
- queued sync should be clear
- user should see a calm recoverable state

Example:
"Saved on this device — will sync when your Ambler Server is available."

### 23. Self-hosted stories should be portable

A saved story package should be capable of preserving:
- story definition
- original/selected media
- thumbnails/posters
- captions
- route data
- theme
- metadata
- version/schema information

The home server should preserve the story, not merely cache temporary URLs.

## Platform lessons

### 24. Web and native must be treated separately

Do not assume:
- native media APIs work on web
- file access is identical
- sharing is identical
- maps render identically
- media playback behaves identically

Shared code is desirable, but platform-safe implementations are allowed where needed.

### 25. Offline behaviour should be intentional

Design offline states for:
- event access
- contribution
- route capture
- story reading
- server sync
- media upload
- sharing

Offline should never silently discard user work.

## Testing lessons

### 26. Use realistic content during UI testing

Mock data should include:
- long event names
- long participant names
- missing images
- videos
- mixed aspect ratios
- crowded events
- empty events
- route-heavy events
- no-route events
- unusual event types

Perfect placeholder data hides real UI defects.

### 27. Test awkward cases before polishing

Important Ambler cases:
- event with no contributions
- one contribution
- video-only event
- route-only event
- expired invite
- revoked share link
- organiser leaves and returns
- guest retries upload
- server offline
- signed URL expired
- failed story generation
- route has bad GPS samples

### 28. A first test build should be worth testing

Do not hand over a build that still contains known blockers likely to dominate the test session.

Before an owner test:
- known critical defects should be fixed
- major flows should be present
- obvious layout problems should be cleared
- build/install should be reliable

## Product/process lessons

### 29. Do not build advanced features before the base interaction is right

Archivist's live-player work demonstrated the cost of polishing advanced animation on top of unstable core behaviour.

For Ambler:
- first make the flow correct
- then make it reliable
- then make it beautiful
- then add advanced motion/3D treatment

### 30. Commercial polish is a deliberate stage

Functional completion does not equal product quality.

Ambler requires a separate pass for:
- motion
- typography
- microcopy
- alignment
- empty states
- loading
- errors
- accessibility
- visual consistency
- transition quality

### 31. Documentation must survive the chat

Any material decision about:
- product direction
- architecture
- UI locks
- Route Replay
- local hosting
- known defects
- build limitations
- release status

must be written into the repository.

Do not depend on conversational memory.

## Known Archivist bug patterns to actively guard against in Ambler

The following patterns caused significant rework in Archivist and should be treated as regression categories:

- background scanner/process hangs UI
- process runs but user cannot tell whether it completed
- metadata/media enrichment partially populates without clear state
- app randomly hangs because long-running work shares the UI path
- animations produce visual artifacts when opening/closing
- animation geometry becomes uneven during transition
- responsive mobile layout clips text that looks fine on wider/folded layouts
- controls appear visually unaligned after responsive changes
- settings become congested as functionality accumulates
- generated media covers/thumbnails are missing despite data existing
- source reports completion but installed build exposes incomplete wiring
- native functionality exists in source but is not registered/exposed to the host platform
- build/export path breaks because lockfile/dependencies do not match source
- server UI exposes technical setup before basic navigation works
- server setup blocks app use despite server being intended as optional
- folder/path entry UX becomes brittle where discovery/browsing would be safer
- multiple source folders create ambiguity over which app is canonical
- browser preview appears correct but real-device layout differs
- persistence is assumed rather than proven across restart
- UI polish changes accidentally regress already-approved layouts

## Ambler-specific application of these lessons

Before major engineering:
1. design the major Ambler screens in Draftbit
2. test the full clickable UI flow
3. lock major layouts and interaction patterns
4. document approved UI decisions in GitHub
5. establish clean build/CI state
6. implement remaining development in small sprints
7. verify each sprint
8. complete Route Replay V2 in staged technical steps
9. test self-hosted storage/offline/recovery paths
10. perform full commercial polish and physical-device acceptance

## Resume requirement

A future Ambler developer or agent must read this document before major development work.

If a proposed implementation conflicts with one of these lessons, the conflict should be explicit and justified rather than accidental.
