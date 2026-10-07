# Ambler UI Sprint 2 — Onboarding + Authentication

Status: design specification complete
Updated: 2026-10-07

## 1. Splash

Full-bleed Ambler Violet.
Centered Ambler mark.
Short, calm reveal; do not hold the user for decorative animation.

## 2. Welcome / onboarding

Three concise story panels:

### Capture
“Bring everyone’s moments together.”
Visual: overlapping event photos + subtle route thread.

### Build
“Ambler turns the event into a story.”
Visual: media becoming a structured story timeline.

### Relive
“Replay the journey, moments and people.”
Visual: Route Replay with photo/video moment.

Controls:
- Continue
- Skip
- Sign in

No server setup here.

## 3. Sign in / create account

Primary:
- Email
- supported social sign-in options

Secondary:
- explain privacy in one short sentence
- link to privacy/terms

Guest invite traffic does not get forced through this screen unless required by the actual contribution path.

## 4. Profile setup

Fields:
- display name
- optional profile photo

Do not over-collect data.

Completion lands on Home.

## Guest bypass

Invite link:
Invite → Guest Join → lightweight session → contribution.

Guest path must not show generic onboarding before the event they were invited to.

## Error states

Design:
- invalid email
- social auth cancelled
- offline
- expired auth link
- account already exists
- retry

Error copy must explain the next action.

## Sprint 2 acceptance

- entry flow is understandable without tutorial text walls
- guest invite remains low friction
- no self-hosting complexity in first run
- all auth failure states are recoverable
