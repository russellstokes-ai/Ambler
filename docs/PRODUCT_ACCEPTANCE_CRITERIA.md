# Ambler — Product Acceptance Criteria

These are the high-level gates for a test candidate worth putting in front of the owner.

## 1. First launch
- onboarding is clear and short
- no stale Vibe Loop copy
- sign-in/legal/privacy controls are real
- guest invite routes bypass unnecessary onboarding
- empty/error/loading states look intentional

## 2. Create
- event creation cannot crash on invalid user input
- event type selection starts curated and remains searchable/browsable
- title, description, dates, type and theme persist
- organiser is correctly attached under RLS
- created event opens into a useful event hub

## 3. Capture / contribute
- organiser and guests can add photos/videos
- camera and library paths work
- upload progress/retry is clear
- guest notes/captions persist
- live event surfaces refresh as contributions arrive
- closed events do not offer actions that will be rejected

## 4. Route Replay
Must meet `ROUTE_REPLAY_V2.md`.

## 5. Build story
- generation uses one full-strength engine in production
- Short / Standard / Epic works
- retry is idempotent
- generation failure leaves a recoverable event
- video-aware story planning is correct
- sparse events degrade gracefully

## 6. Relive
- cinematic Story Ready reveal
- story media opens reliably after signed URLs have expired and been refreshed
- video pages play correctly
- edit controls are understandable and persisted
- no dead buttons or prototype labels

## 7. Share
- private link works logged out
- link can be revoked
- expired link fails cleanly
- browser story does not depend on native-only APIs
- shared route redacts sensitive location endpoints

## 8. Account/privacy
- organiser can moderate guest content
- guests cannot self-escalate into private events without invite flow
- account/event deletion purges associated private storage as intended
- anonymous guest sessions do not become broken partial accounts

## 9. Release quality
- source/backend/engine tests pass
- clean lockfile generated and committed
- typecheck passes
- Android debug + release build passes
- web export passes
- physical-device smoke test passes
- no unlicensed soundtrack assets are bundled
