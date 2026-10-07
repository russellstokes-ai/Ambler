# Ambler UI Sprint 7 — Route Replay V2 + Story Edit + Share

Status: design specification complete
Updated: 2026-10-07

## 25. Route Replay V2

Reference motion benchmark: Map Animator.
Ambler must remain an interactive story, not a video-rendering clone.

### Opening state

- map fills the story canvas
- event title / route summary appears briefly
- Start Replay primary action
- duration/distance only when factual

### Playing state

- route draws progressively
- camera follows meaningful legs rather than every GPS point
- media moments appear at genuine GPS positions
- UI chrome stays minimal

Controls:
- play/pause
- progress/scrub
- explore map
- sound only when the story/media needs it
- exit/back

### Adaptive scene treatments

Terrain:
- elevation/terrain depth
- cinematic oblique camera

City:
- 3D building treatment when renderer supports it
- lower camera angle
- landmarks/labels restrained

Town/village:
- simplified context
- media and route are primary

Road trip:
- wider camera
- clear leg/stop progression

Venue/theme park/festival:
- tighter bounds
- clustered media moments
- event footprint is more important than long-distance geography

### Route media

Marker is a media moment, not a generic pin.

Single item:
- circular/rounded thumbnail
- video play mark where needed

Cluster:
- representative image
- item count
- subtle stack treatment

Tap:
- pause replay
- open Route Moment Viewer
- close returns to exact replay point

No GPS:
- media stays in story
- never falsely pinned

### Explore mode

User can pan/zoom without fighting the playback camera.
“Resume Replay” returns to the playback state.

### Privacy

Shared stories use privacy-safe route geometry.
Private source route remains accurate for calculations.

### Reduced motion

- no cinematic camera fly-through
- complete route visible
- media moments selectable
- optional simple progressive highlight

## 26. Route Moment Viewer

- photo fullscreen
- video playback
- swipe through cluster
- contributor attribution where permitted
- caption/place/time where useful
- close returns to route state

## 27. Story Editor

Structure:
- story page strip/list
- selected page preview
- contextual edit actions

Actions:
- reorder pages
- edit copy/caption
- choose cover
- remove moment from story
- hide person/location where supported
- regenerate one section
- change story length if regeneration is required

Do not expose raw JSON or engine terminology.

## 28. Theme + Music

Theme:
- visual previews
- current theme clearly selected
- recommended options first

Music:
- soundtrack preview
- mood/energy label
- no track ships unless rights are confirmed

## 29. Share + Export

Private link:
- Create / Copy
- expiry/status
- revoke

Exports:
- story card image
- print/PDF foundation
- future richer video export can be shown only when actually implemented

Storage:
- Save to Home Server action if a server is connected
- status shown without making sharing dependent on server availability

## 30. Shared Web Story

Recipient opens directly into the story.

Requirements:
- no app install required
- browser-safe media playback
- responsive mobile/desktop
- Route Replay rich renderer where possible
- graceful lightweight fallback
- expired/revoked link has designed state

## Sprint 7 acceptance

- all Route Replay interaction states are specified
- group photo/video moments are central to replay
- route playback can be paused/explored/resumed
- story editor feels simple
- sharing remains private by default
- web recipient gets a recognisable Ambler experience
