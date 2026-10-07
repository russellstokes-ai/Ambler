# Ambler UI Sprint 8 — Self-Hosting + Settings + UI Test Checkpoint

Status: design specification complete
Updated: 2026-10-07

## 31. Profile

- avatar
- display name
- stories/events summary
- Settings
- Storage & Hosting
- Privacy & Data
- Sign out

Avoid gamification unless later approved for Ambler.

## 32. Settings

Sections:
- Appearance
- Notifications
- Story preferences
- Storage & Hosting
- Privacy & Data
- Accessibility
- About Ambler

Keep technical options out of the default path.

## 33. Privacy & Data

Controls / information:
- route privacy
- default event privacy
- contribution permissions where appropriate
- export data
- delete account

Deletion must explain impact on:
- owned events
- media
- shared links
- cloud content
- Home Server copies where Ambler can control them

## 34. Storage & Hosting

Purpose: let normal users ignore hosting while giving power users real ownership.

Storage summary:
- This device
- Ambler-hosted/cloud storage, where available
- Ambler Home Server

Default destination for completed stories:
- Ambler Cloud
- My Ambler Server
- Device/local where supported

Per-content toggles:
- completed stories
- original media
- generated thumbnails/posters
- exports

A server is optional. No first-run requirement.

## 35. Add Ambler Server

Preferred connection methods:
1. Discover on local network
2. Scan server QR
3. Enter server address manually

Connection flow:
- searching
- found server
- verify server identity/name
- connect/authenticate
- choose sync defaults
- complete

Avoid raw tokens and filesystem paths unless an advanced user explicitly asks for them.

## 36. Server Detail / Sync

Show:
- server name
- connection state
- storage used/free
- last successful sync
- pending items
- remote access state
- content policy

Actions:
- Sync now
- Change what is stored
- Test connection
- Disconnect

Offline:
“Saved on this device — will sync when your Ambler Server is available.”

Never imply sync succeeded before the server confirms persistence.

## Self-hosted story package UX contract

A stored story must conceptually preserve:
- story definition/version
- selected/original media according to settings
- thumbnails/posters
- captions/notes
- route data
- theme
- metadata

The UI should communicate “Your story is safely stored”, not implementation details.

## Final polish sweep

Review all 36 screens for:
- typography hierarchy
- alignment
- control consistency
- clipping
- safe areas
- keyboard overlap
- loading/error/empty states
- destructive confirmation
- dark/light mode
- reduced motion
- realistic long text
- video posters
- storage badges
- fold-open composition
- no dead controls

## Required prototype test journeys

### Journey A — organiser
Home → Create Event → Event Type → Theme → Privacy/Route → Invite → Live Event Hub → Add Moment → Finish → Generate → Story Ready → Relive.

### Journey B — guest
Invite Link → Join → Add photos/video → Add note → successful contribution.

### Journey C — route
Live Event → Record Route → Finish → Relive → Route Replay → cluster → video → close → resume replay.

### Journey D — edit/share
Relive → Edit → reorder/change cover/theme/music → Save → Share → browser story → revoke link.

### Journey E — self-hosting
Profile → Storage & Hosting → Discover/Connect Server → select story storage → completed story sync → server unavailable → queued/recovered state.

## UI-testing data pack

Prototype must include:
- long event title
- 1-photo event
- video-only event
- mixed photo/video event
- 100+ moment event
- no-route event
- route-heavy hiking event
- city trip
- theme park/venue event
- failed upload
- expired share link
- offline state
- disconnected Home Server

## Pre-final UI checkpoint

The UI is ready to lock when:
- all 36 primary screens are navigable
- five test journeys complete without dead ends
- compact phone and fold-open layouts both pass review
- no major feature requires a new navigation model
- Route Replay states are approved
- self-hosting is understandable without technical knowledge
- remaining issues are styling/wording/minor interaction refinements rather than structural redesign

After this checkpoint, major UI layout changes require explicit justification.
