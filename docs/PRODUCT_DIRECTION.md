# Ambler — Product Direction

Updated: 2026-10-04

This document records the approved product direction so future development does not depend on chat history.

## One-line product

Ambler turns a shared event, trip or activity into a private, cinematic story built from the group's photos, videos, notes, route and real captured signals.

## Core product model

### Capture
- create an event
- invite by link / QR
- allow low-friction guest participation
- collect photos, videos and notes
- optionally record the route
- keep the event private by default

### Build
- deterministic curation first
- score and select media
- build chapters/timeline
- derive factual route/activity/event insights
- choose treatment/theme
- create a finished story automatically
- editing comes after generation, not before

### Relive
- cinematic Story Ready reveal
- swipe/watch through the finished story
- Route Replay as a headline storytelling surface
- private web viewing without requiring the app
- export/print foundations
- subtle path to create another Ambler story

## Story philosophy

The story is the product.

Do not turn Ambler into:
- a generic shared album
- a group chat
- ticketing / payments / RSVP software
- a seating planner
- an AI memory-invention tool

Generative AI is optional polish only. The core product must work without it.

Never invent:
- memories
- emotions
- quotes
- scores
- locations
- health/activity statistics
- events that were not captured

## Content system

Keep a reusable story-family architecture rather than one bespoke engine per event type.

Current direction includes 52 selectable event types supported by broader narrative families such as:
- party / night out
- birthday
- wedding / engagement
- family / sentimental
- trip / holiday
- road trip / journey
- hiking / trekking
- sport / match day
- fitness / group workout
- festival / concert
- day out / theme park
- celebration / graduation
- corporate / team
- general / custom

Themes remain reusable and interchangeable.

## Route Replay — headline feature

Route Replay should look like an Ambler story, not a generic embedded map.

### Adaptive map treatment

The renderer should adapt to geography/event context:

**Mountain / hiking / countryside**
- real 3D terrain/elevation
- cinematic oblique camera
- route drawn over terrain
- elevation/high-point treatment when supported by captured data

**City**
- 3D buildings / landmarks
- themed lighting and reduced clutter
- route visually dominant through streets
- nightlife can use a darker/neon treatment

**Town / village**
- simpler building/road treatment
- media and route become the primary visual focus

**Road trip**
- wider geographic framing
- progression between towns/regions
- chapter-like camera moves

**Venue / festival / theme park**
- tighter area framing
- denser media clusters and stop moments

### Mapping architecture direction

- live capture/navigation view: practical native map implementation
- final Relive Route Replay: dedicated Ambler renderer
- preferred rich-map direction: Mapbox-based 3D terrain/buildings/lighting, subject to verified native compatibility
- shared web story: rich WebGL renderer where supported
- graceful polished 2D fallback everywhere

### Group media on the route

All participants' geotagged media may become route moments.

Requirements:
- photos and videos
- real GPS placement only
- contributor attribution where permitted
- video poster/thumbnail
- nearby media clustering
- tap marker/cluster to view
- photo full-screen
- video playback controls
- swipe between media at a stop
- return to replay at the same progress point
- non-geotagged media stays in the story but is never falsely pinned

### Replay behaviour

- route draws progressively
- camera follows meaningful sections, not every GPS sample
- media appears at the relevant route moment
- important stops can pause briefly
- user can pause/skip/explore
- reduced-motion path remains fully usable

### Theme examples

- Cinematic: dark/neutral geography + warm route glow
- Luxe: restrained monochrome + gold
- Nightlife: dark urban map + neon route
- Family: warmer/softer treatment
- Outdoors: terrain-forward
- Minimal: sparse labels and clean route

### Privacy

Keep accurate private route data for calculations.

Redact or blur sensitive start/end positions only in shared/rendered contexts. Never corrupt private source route data in order to achieve privacy.

## First-owner-test standard

The first test build should not contain:
- dead buttons
- placeholder screens
- misleading success states
- controls that the backend rejects
- expired signed media
- broken video tiles
- orphaned screens
- silent degraded story generation
- exposed unfinished features
- unlicensed production music

Test awkward cases deliberately:
- no media
- one photo
- video only
- route only
- mixed media
- failed generation
- revoked share link
- closed event
- stale invite
- poor/no network

## Future development priority

1. prove baseline builds and backend
2. re-verify fine-tooth audit fixes
3. complete Route Replay V2
4. visual/interaction QA of the whole first-run flow
5. physical device testing
6. only then broaden features
