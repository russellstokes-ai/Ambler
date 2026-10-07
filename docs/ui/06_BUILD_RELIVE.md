# Ambler UI Sprint 6 — Build + Relive

Status: design specification complete
Updated: 2026-10-07

## 21. Finish Event / Build Story

Organiser sees a summary:
- participants
- photos
- videos
- notes
- route availability
- event duration

Story length:
- Short
- Standard
- Epic

Default recommendation is based on available content.

Primary: Build My Story.

Secondary:
- return to event
- review moments

The screen should feel like transition from Capture to Build.

## 22. Story Generation Progress

Do not use a generic indefinite spinner.

Use real phases:
1. Preparing moments
2. Building the timeline
3. Mapping the journey, if route exists
4. Creating the story
5. Saving

Progress may be phase-based rather than fake percentage.

User can leave the screen if generation is safely persisted/backgrounded.

Failure:
- explain failure
- Retry
- return to event
- preserve source media

Retry must not create duplicate stories.

## 23. Your Story Is Ready

Cinematic reveal.

Sequence:
- Ambler mark / event color
- cover image fades/reveals
- title
- “Your story is ready”

Primary: Relive Story
Secondary: Edit

Reduced motion:
- simple fade
- no zoom/parallax

## 24. Relive Story

This is Ambler’s core product surface.

Presentation:
- full-bleed media where appropriate
- minimal chrome
- page/section progress
- swipe navigation
- tap to reveal controls
- optional autoplay

Story page families:
- cinematic opening
- timeline/chapter
- hero gallery
- route replay
- factual insights
- friend captions
- share ending

Video:
- proper poster before playback
- playback controls do not fight story swipe
- return to story position after fullscreen playback

Story themes affect the story, not the entire application shell.

## Resume behaviour

Persist:
- current story page
- media playback position where appropriate
- whether the Story Ready reveal has already been seen

Reopening a story should not replay onboarding/reveal unnecessarily.

## Empty/sparse story handling

One-photo story:
- elegant keepsake treatment

Video-only:
- video-first composition

Route-only:
- Route Replay can become the hero

Sparse:
- fewer, better pages; never pad with invented content

## Fold-open

Relive may use:
- wide cinematic hero
- two-column editorial composition
- larger route canvas

Never emulate a physical two-page book unless the selected theme calls for it.

## Sprint 6 acceptance

- end-of-event transition is clear
- generation states are believable and recoverable
- Story Ready feels premium
- Relive is visually distinct from the source gallery
- sparse/odd content remains intentional
- story progress persists
