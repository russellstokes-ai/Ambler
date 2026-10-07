# Ambler — Draftbit Implementation Checklist

Updated: 2026-10-07

This is the practical build checklist for turning the approved `docs/ui/` specifications into the clickable Draftbit prototype.

Status:
- product concept: locked
- UI architecture/specification: locked for prototype build
- Draftbit implementation: pending
- owner UI acceptance: pending

## Reusable components to create first

Create these once before assembling screens:

- AmblerHeader
- BottomNav
- CreateFAB
- PrimaryButton
- SecondaryButton
- IconButton
- StatusPill
- StorageBadge
- EventHero
- EventRow
- StoryCover
- MediaTile
- PersonAvatar
- UploadProgress
- EmptyState
- ErrorState
- InlineRetry
- BottomSheet
- ConfirmationSheet
- SegmentedControl
- ThemePreview
- ServerStatus
- RouteMediaMarker
- RouteMediaCluster
- StoryProgress
- SectionHeader

## Screen build matrix

### Entry / identity
- [ ] Splash
- [ ] Welcome / onboarding
- [ ] Sign in / create account
- [ ] Profile setup

### Main shell
- [ ] Home
- [ ] Events
- [ ] Stories Library
- [ ] Archive

### Event creation / live event
- [ ] Create Event — basics
- [ ] Event Type
- [ ] Story Style / Theme
- [ ] Privacy + Route options
- [ ] Invite / QR
- [ ] Live Event Hub
- [ ] Moments / Gallery
- [ ] Add Moment
- [ ] Route Capture

### Guest path
- [ ] Guest Join
- [ ] Guest Contribution
- [ ] Guest Upload Result / Retry

### Build / Relive
- [ ] Finish Event / Build Story
- [ ] Story Generation Progress
- [ ] Your Story Is Ready
- [ ] Relive Story
- [ ] Route Replay V2
- [ ] Route Moment Viewer

### Edit / share
- [ ] Story Editor
- [ ] Theme + Music
- [ ] Share + Export
- [ ] Shared Web Story

### Account / hosting
- [ ] Profile
- [ ] Settings
- [ ] Privacy & Data
- [ ] Storage & Hosting
- [ ] Add Ambler Server
- [ ] Server Detail / Sync

Total primary screens: **36**

## Required prototype data

Use realistic data rather than perfect placeholders.

### Events
1. **Snowdon Weekend**
   - route-heavy hiking event
   - 8 participants
   - 87 photos
   - 12 videos
   - long route
   - elevation data
   - Home Server storage

2. **Saturday in Barcelona**
   - city trip
   - 5 participants
   - mixed media
   - city route
   - multiple clustered moments

3. **Sophie's 40th Birthday Celebration at The Orangery**
   - deliberately long title
   - celebration/no meaningful route
   - 60+ mixed moments
   - several notes/captions

4. **Thorpe Park Day**
   - venue/theme-park route
   - dense short-range GPS
   - repeated media clusters

5. **One Quiet Afternoon**
   - one photo only
   - proves sparse story treatment

6. **Five-a-side Final**
   - video-only story test

7. **Walking the Thames**
   - route-only / very sparse media test

### System/error states
- upload failed
- video thumbnail missing
- offline
- expired invite
- revoked share link
- story generation failed
- server offline
- server reconnecting
- story queued for server sync

## Responsive checkpoints

Every primary screen must be checked at:

### Compact
- 360 × 800 class
- no clipped labels
- no overlapping fixed controls
- minimum 16 dp page gutter
- bottom nav safe-area aware

### Standard phone
- 412–430 dp width
- expected default composition

### Fold open
- use wider composition where beneficial
- Home, Event Hub, Story Editor and Hosting should use intentional two-pane layouts
- text lines retain readable width
- Route Replay may use full available canvas

Do not merely stretch the compact design.

## Required interaction states

### Navigation
- selected nav item
- create action
- back/cancel
- modal/sheet close
- keyboard-visible layouts

### Media
- image
- video poster
- video playing
- media loading
- missing thumbnail
- upload progress
- upload failed
- retry

### Events
- upcoming
- live
- finished
- archived

### Story generation
- preparing
- timeline
- mapping
- building
- saving
- failed
- retry
- complete

### Route Replay
- opening
- playing
- paused
- scrubbing
- media moment
- cluster
- photo viewer
- video viewer
- explore mode
- resume replay
- reduced motion
- no route
- privacy-redacted shared route

### Hosting
- no server configured
- discovering
- server found
- connecting
- connected
- syncing
- offline
- queued
- recovered
- storage nearly full

## Prototype links that must work

The five owner-test journeys must be clickable from start to finish.

### A — Organiser
Home → Create Event → Event Type → Theme → Privacy/Route → Invite → Event Hub → Add Moment → Finish Event → Generate Story → Story Ready → Relive

### B — Guest
Invite → Guest Join → Add Photo/Video → Add Note → Upload Result

### C — Route
Event Hub → Route Capture → Finish → Relive → Route Replay → Media Cluster → Video → Return → Resume

### D — Edit/share
Relive → Story Editor → Reorder/cover/theme/music → Save → Share → Web Story → Revoked link

### E — Self-hosting
Profile → Storage & Hosting → Add Server → Discover/QR/manual → Connect → Choose storage → Story sync → Offline → Recovered sync

## UI review checklist

Before calling the Draftbit prototype ready for owner testing:

- [ ] no clipped text
- [ ] no unanchored buttons/icons
- [ ] no status-bar overlap
- [ ] no bottom-nav overlap
- [ ] no duplicate/ghost animation layers
- [ ] no dead buttons
- [ ] no generic placeholder copy
- [ ] no developer terminology
- [ ] video is visually distinct from photos
- [ ] server is optional everywhere
- [ ] storage location is subtle and understandable
- [ ] route media looks like story moments, not generic map pins
- [ ] errors explain the next action
- [ ] real progress is used where known
- [ ] destructive actions have confirmation
- [ ] compact and Fold layouts both feel intentional

## Lock rule

After owner UI testing:
1. record all accepted corrections in `docs/ui/`
2. mark each major screen as **UI Accepted**
3. treat major layout/navigation changes after that point as controlled changes
4. resume engineering against the accepted UI rather than redesigning during implementation
