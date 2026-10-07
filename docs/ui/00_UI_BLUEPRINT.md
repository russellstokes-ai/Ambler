# Ambler UI Blueprint — Sprint 0

Status: canonical UI planning baseline
Updated: 2026-10-07

## Purpose

This is the UI source-of-truth for the pre-engineering Draftbit phase. GitHub remains canonical. Draftbit is the visual/prototype implementation surface.

The UI must make **Capture → Build → Relive** obvious without teaching architecture.

## Navigation model

Primary signed-in navigation:
- Home
- Events
- Stories
- Profile
- persistent central Create action

Settings and Storage & Hosting live under Profile.

Guest invite links bypass the signed-in shell and open directly into the event contribution flow.

## Device targets

Design and test all major screens at:
- compact phone: 360–390 dp
- standard phone: 412–430 dp
- foldable closed: narrow phone rules
- foldable open: two-column/wide composition where useful
- tablet/web: max-width content and expanded composition rather than simple stretching

Never allow status-bar overlap, clipped labels, floating controls without anchors, or full-width text lines on very wide screens.

## Primary screen inventory

### Entry / identity
1. Splash
2. Welcome / onboarding
3. Sign in / create account
4. Profile setup

### Main shell
5. Home
6. Events
7. Stories Library
8. Archive

### Event creation / live event
9. Create Event — basics
10. Event Type
11. Story Style / Theme
12. Privacy + Route options
13. Invite / QR
14. Live Event Hub
15. Moments / Gallery
16. Add Moment
17. Route Capture

### Guest path
18. Guest Join
19. Guest Contribution
20. Guest Upload Result / retry state

### Build / Relive
21. Finish Event / Build Story
22. Story Generation Progress
23. Your Story Is Ready
24. Relive Story
25. Route Replay V2
26. Route Moment Viewer

### Edit / share
27. Story Editor
28. Theme + Music
29. Share + Export
30. Shared Web Story

### Account / hosting
31. Profile
32. Settings
33. Privacy & Data
34. Storage & Hosting
35. Add Ambler Server
36. Server Detail / Sync

Primary UI target: **36 screens**.

## Overlay / state inventory

Not separate navigation pages:
- event type search
- event type category picker
- media picker
- camera permission
- location consent
- note/caption composer
- invite/share sheet
- participant list
- remove participant confirm
- story page reorder
- cover picker
- delete/archive confirmation
- server unavailable
- upload retry
- generation retry
- expired/revoked share link
- offline queue status
- media cluster sheet

## Product interaction rules

- Primary action per screen must be visually obvious.
- Secondary options should not compete with the main task.
- Guest contribution requires minimal cognitive load.
- Completed stories should look like finished media products, not database records.
- Storage location should be visible but quiet: Device / Ambler Cloud / Home Server.
- Route Replay is cinematic first, map-tool second.
- Server configuration must never block ordinary Ambler use.
- Destructive actions require clear confirmation and consequences.
- Background work must expose real progress and remain cancellable/recoverable where practical.

## Responsive composition

Compact:
- single column
- bottom navigation
- edge-safe media
- full-width primary actions with 16–20 dp margins

Wide/fold:
- do not merely stretch
- use split layouts for Home/Event Hub/Story Editor/Hosting where useful
- maintain readable max text widths
- story/route surfaces may use the full canvas

## UI acceptance gate

UI phase is ready for owner testing when:
- all 36 primary screens are navigable in prototype form
- realistic mock data is present
- core journey can be completed without dead ends
- compact and fold-open layouts are both coherent
- empty/loading/error/offline/server-unavailable states are represented
- major layouts are stable enough to lock before heavy engineering
