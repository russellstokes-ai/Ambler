# Ambler Jobs 6–15 — Implementation Checkpoint

This checkpoint completes the source work for the remaining post-MVP roadmap after the Capture → Build → Relive flow.

## 6. Story intelligence

Implemented:

- Short / Standard / Epic story planning
- route-heavy event planning
- media-burst detection
- time-gap, place-change and route-distance chapter boundaries
- adaptive chapter counts and page dwell pacing
- deterministic copy selection so the same event is stable while different events vary

## 7. Content depth

Implemented:

- 52 event types
- 14 narrative families
- hundreds of authored section treatments plus event-specific overrides
- dedicated hiking, sport, run/walk, cycling, group workout, fitness, skiing, theme park, cruise, wedding, birthday, festival, family, graduation, road trip and camping language
- no generative AI dependency for core story creation

## 8. Activity stories

Implemented from captured data only:

- route distance
- moving duration
- average moving speed / pace
- maximum speed where meaningful
- stops
- elevation gain/loss when sufficient altitude samples exist
- high/low elevation and high-point marker
- privacy-redacted Route Replay

Ambler does not invent calories, heart rate, scores or elevation when the source data does not contain them.

## 9. Story editing

Organisers can:

- edit story copy
- edit rendered friend captions without changing the contributor's original database note
- reorder pages
- promote cover media
- remove media from the rendered story
- change theme and soundtrack
- hide a person or location from the rendered story
- regenerate an individual generated section in preview mode
- save the edited canonical storybook

## 10. Presentation

Implemented:

- cinematic story-ready reveal
- animated/swipeable pager
- optional auto-play story pacing
- reduced-motion support
- haptics
- page navigation indicators
- dynamic layout width for resizable/foldable displays
- web-safe Route Replay renderer

## 11. Production content

Implemented engineering safeguards:

- engine and player share one soundtrack ID catalogue
- music-selection fallback cannot select missing bundle files
- `music-manifest.json` licensing ledger
- production-asset validator

Production build currently bundles no soundtrack audio. The validator passes only because no unlicensed files ship; a licensed music pack can be added later through the existing catalogue/player architecture.

## 12. Export

Implemented:

- native story-card image save path
- PDF story export
- browser print / Save as PDF
- share-card/private-link flow
- printable HTML foundation for future physical books

## 13. Remaining application UI

Implemented:

- real Home feed
- archived-event view
- archive/restore and permanent deletion
- storage-clean event/account deletion
- organiser moderation of guest media
- notification preference UI
- About screen
- Privacy & Data controls
- upload retry states already present in the media queue

## 14. Testing

Implemented:

- source syntax/import/config integrity checker
- deterministic story-engine tests covering route metrics, story length, bursts, timeline splitting, event content and soundtrack mapping
- GitHub Actions source/typecheck pipeline
- global render crash boundary and scrubbed local diagnostics without third-party telemetry

The local isolated environment cannot perform a clean network dependency install. CI is configured to do so in a networked GitHub runner.

## 15. Android release readiness

Implemented:

- Ambler Android/iOS package identity
- Ambler launcher/splash assets
- adaptive icon configuration
- Expo SDK 52 direct dependencies pinned to the SDK 52 compatibility matrix
- broad Android media read permissions blocked; picker uploads remain user-selected
- Android backup disabled
- Android debug APK CI job
- manual release-readiness workflow
- Play listing, Data Safety, Privacy and Terms working drafts
- production release checklist

Remaining release gates are deployment/build/external-content tasks listed in `RELEASE_CHECKLIST.md`, not unimplemented product features.
