# Ambler Story Content System

Ambler's core story experience does not require generative AI. The story engine combines real event data with a large authored content library, deterministic selection, theme styling, media curation, route data, timelines, captions, music and factual insights.

## Coverage

- 52 event types in the event catalogue.
- 14 narrative families: celebration, nightlife, travel, journey, hiking, outdoors, sport, fitness, wedding, family, festival, milestone, community and custom.
- 5 authored variants for each of 7 major story sections per family: opening, timeline, route replay, hero gallery, story insights, friend captions and ending/share.
- 490 authored page-copy variants in the family library before theme-specific copy and event-specific copy are applied.
- 8 vibe phrases per family (112 additional authored phrases).
- 13 visual/theme voices remain available on top of the event-family content.

## Activity-focused event types

Ambler includes dedicated activity modes for:

- Hiking Day
- Sports Event
- Sports Trip
- Match Day
- Group Workout
- Run or Walk
- Cycle Ride
- Fitness Challenge
- Backpacking Trip
- Ski Trip
- Camping Trip

These modes receive relevant timeline chapter labels, route-led story copy, music preferences and factual insights. Hiking has a dedicated narrative family rather than using generic travel copy.

## Factual-only activity insights

The engine should not invent performance data. It may use values that can be derived from recorded event/media/location data, including:

- event duration
- route distance
- places/stops visited
- photo/video count
- contributor count
- peak media-capture window
- longest recorded stop
- average pace for suitable walking/running/hiking routes when distance and duration exist
- average route speed for cycle rides when distance and duration exist
- top media contributor

Elevation, scorelines, calories, heart rate, race position and similar values must only appear if Ambler later receives real source data for them.

## Deterministic variation

Copy selection uses a stable event seed. Regenerating the same event keeps its voice coherent, while different events select different authored variants. This provides large-scale variation without sending private memories to a generative AI service.

## Future expansion

The library is deliberately data-driven. More families, phrases, languages and event-specific packs can be added without changing the story engine. Optional generative narration can be layered on later as a user-controlled enhancement, not a dependency.
