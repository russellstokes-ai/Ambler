# Route Replay V2 — Final Product Requirement

This is an approved headline feature and must be represented in the final Ambler build.

## Experience goal

Route Replay should feel like an Ambler story, not an embedded navigation map.

The route is reconstructed from real captured GPS data. Ambler controls the camera, visual treatment, animation, route styling, media moments and storytelling.

## Adaptive geography treatment

The renderer selects a treatment according to geography/event context:

### Mountain / hiking / countryside
- 3D terrain/elevation
- cinematic tilted camera
- terrain or satellite-derived surface
- route drawn over the terrain
- elevation profile / high-point moments when source data supports it

### City
- 3D buildings / landmarks
- lower cinematic camera angle
- subdued map labels and POIs
- strong route line through streets
- night/dusk treatment for nightlife where appropriate

### Town / village
- simplified buildings/roads
- route and people/media take visual priority
- fewer labels and less map clutter

### Road trip / long journey
- wider camera framing
- route progression between towns/regions
- chapter-style camera transitions

### Venue / festival / theme park
- tighter overhead/oblique view
- clustered media moments around areas/stops

## Mapping architecture

Preferred final renderer: Mapbox Standard / Standard Satellite using 3D environment capabilities for buildings, terrain, landmarks, trees and dynamic lighting.

Current application architecture is Expo 52 / React Native 0.76 with legacy architecture enabled. Current `@rnmapbox/maps` releases require a deliberate native compatibility/new-architecture upgrade. Do not silently swap SDKs without completing that migration and build verification.

Required fallback:
- if the 3D renderer is unavailable or unsupported, render a polished Ambler 2D route experience rather than failing
- public web story must have a WebGL-capable rich renderer with a lightweight fallback

## Group media pinned to the route

All event participants' geotagged photos and videos are eligible to appear on Route Replay.

Each route media moment must contain:
- media ID
- event ID
- contributor ID/display identity where permitted
- media type: image/video
- GPS latitude/longitude
- captured timestamp
- thumbnail/poster URI for video
- signed/full media URI resolved at view time
- optional caption/note

### Interaction

- media appears at or near its real capture location
- nearby items cluster automatically
- clusters show a media count and representative thumbnail
- tap a marker/cluster to open the media moment
- photos open full-screen
- videos open with playable controls and poster image
- swipe between nearby media in the same stop/cluster
- return to replay without losing route progress

## Replay motion

- route draws progressively rather than appearing fully formed
- camera follows meaningful route sections rather than every GPS point
- media moments appear at the appropriate point in progression
- chapter/stops can pause briefly for emphasis
- user can pause, scrub/skip or manually explore
- reduced-motion mode removes cinematic camera movement while preserving access to all information

## Styling

Story theme affects the map presentation:
- Cinematic: dark/neutral map, warm route glow
- Luxe: restrained monochrome / gold accents
- Nightlife: dark city / neon route treatment
- Family: warmer, softer treatment
- Outdoors: terrain-forward treatment
- Minimal: clean route and sparse labels

The map provider supplies geography. Ambler supplies the visual storytelling layer.

## Privacy

- retain accurate private route data for calculations and organiser view
- redact/blur sensitive endpoints only for rendered/shared versions
- do not expose exact home/private start/end positions by default in public/shared stories
- media without GPS remains part of the story but is not falsely placed on the route

## Acceptance criteria

Route Replay V2 is not complete until:

- [ ] adaptive terrain/city/town rendering is working
- [ ] 3D renderer verified on Android and iOS release builds
- [ ] group photos appear along the route
- [ ] group videos appear with real poster/thumbnail and playback
- [ ] close-by media clusters cleanly
- [ ] marker/cluster tap opens media viewer
- [ ] replay animation follows route progression
- [ ] camera treatment varies by route context
- [ ] theme styling affects replay treatment
- [ ] reduced-motion fallback works
- [ ] private-route vs shared-route redaction is tested
- [ ] web story has rich renderer plus graceful fallback
- [ ] route works with sparse, dense and media-free events
