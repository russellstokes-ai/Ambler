# Ambler UI Sprint 5 — Capture + Guest Contribution

Status: design specification complete
Updated: 2026-10-07

## 15. Moments / Gallery

Purpose: show the shared event memory pool without pretending it is the finished story.

Layout:
- chronological media grid
- contributor avatar/name where appropriate
- photo and video differentiation
- reaction indicator
- notes/captions associated with media

Filters:
- All
- Photos
- Videos
- Mine

Do not expose technical upload/storage metadata.

## 16. Add Moment

Entry choices:
- Take photo
- Record video
- Choose from library
- Add note

After selection:
- preview
- optional caption
- optional location inclusion if available/consented
- Add to Event

Upload begins without blocking the entire app.

Progress:
- Preparing
- Uploading
- Saving
- Added

Failures remain visible and retryable.

## 17. Route Capture

States:
- Not started
- Ready
- Recording
- Paused
- Completed
- Permission unavailable

Recording screen:
- map
- elapsed time
- distance when reliable
- clear recording indicator
- Pause / Resume / Finish

Never fabricate distance, pace or elevation from insufficient samples.

Location consent is explicit and understandable.

## 18. Guest Join

Open directly from invite/QR.

Shows:
- event name
- organiser
- event date/location if shared
- event visual identity
- “You’re invited to add your moments”

Primary action: Join Event.

Avoid a generic account wall.

## 19. Guest Contribution

A stripped-back contribution surface:
- Add photos/video
- Add a note
- see own submitted items
- contributor display name where needed

The guest should not need to understand Ambler navigation.

## 20. Guest Upload Result / Retry

Success:
- media thumbnail(s)
- “Added to [Event]”
- Add more
- Done

Failure:
- failed item remains visible
- Retry
- Remove
- clear reason where known

If offline:
- “Saved on this device — upload will continue when you’re online” only if the implementation genuinely supports that queue.

## Media rules

- video always has a poster
- mixed aspect ratios cannot break the grid
- missing thumbnail has an intentional fallback
- duplicate upload state is handled
- large upload progress is real
- navigation remains responsive during upload

## Fold-open

Gallery becomes denser; Add Moment remains focused and centered.
Guest web flow remains narrow/readable rather than filling the whole viewport.

## Sprint 5 acceptance

- organiser/member capture is fast
- guest contribution is lower friction than creating an account
- progress is meaningful
- failed upload never silently disappears
- photo/video distinctions are correct
- route recording has clear privacy and status
