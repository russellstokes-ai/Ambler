# Ambler UI Motion Standard

Status: approved motion direction for the UI review branch.

Reference benchmark: Map Animator — https://mapanimator.baldinger.se/

Ambler borrows the reference's **clean journey pacing**, not its interface or visual identity. Motion must help explain sequence, place and story progression.

## Principles

1. **Motion follows meaning.** Animate a route because the journey is unfolding. Reveal a media cluster because the replay has reached that moment. Do not animate ordinary settings merely to make them feel active.
2. **One dominant motion at a time.** Avoid simultaneous competing card, icon and background movement.
3. **Cinematic, not energetic.** Prefer eased 350–800 ms reveals and slower background drift. Avoid bouncy/spring-heavy motion except tiny direct-manipulation feedback.
4. **Story before chrome.** Story media, route progression and chapter changes may carry motion; navigation and utility controls remain stable.
5. **No invented progress.** Animation may visualise known route/story sequence but must never imply a location, stop, upload or generation state that did not occur.
6. **Reduced motion is first-class.** When the OS requests reduced motion, progressive/camera motion resolves immediately while all information and controls remain available.

## Approved uses

### Route Replay — strongest motion treatment
- route segments draw progressively in journey order
- camera/terrain layer may drift subtly while playback is active
- geotagged media markers reveal only after the replay reaches their section
- stop labels and moment summaries arrive after the associated route leg
- current-position focus may pulse gently
- pause freezes journey progression; Explore releases the guided-camera feel
- returning from a photo/video restores the exact replay position

### Story Ready
- restrained opening composition
- event identity first, then cover/hero mark, title, statistics and final Story Ready confirmation
- route motif may draw behind the reveal
- no confetti-style celebration unless the story/event theme explicitly calls for it

### Relive
- chapter/time marker first
- headline second
- hero media third
- caption/attribution last
- page changes should crossfade/translate subtly, resembling editorial pagination rather than carousel snapping

### Onboarding
- each Capture → Build → Relive stage can animate its own relevant visual
- route lines draw, cards/media settle in, copy crossfades between stages
- transitions stay short enough that onboarding never feels blocked

### Live event surfaces
- live pulse is subtle
- active route motif can trace once on entrance
- contributor/media changes may fade in
- no continuously moving dashboard decoration

### Home Server
- discovery can use a restrained radar pulse while actively searching
- sync progress may animate only while a sync is actually happening
- connected/idle screens remain still

## Deliberately calm surfaces

Keep these predominantly static:
- settings
- privacy/data controls
- account/profile forms
- archive lists
- ordinary search/filter states
- destructive confirmation flows

Press feedback is sufficient for these areas.

## Timing guide

- direct press feedback: 100–180 ms
- small content reveal: 280–420 ms
- editorial/story reveal: 420–600 ms
- route segment draw: 560–760 ms
- between route legs: 100–220 ms visual overlap/stagger
- subtle terrain/camera drift: roughly 6–8 seconds per direction

These are ranges, not hard-coded rules. Pacing should be tuned on real devices.

## Current prototype implementation

The UI review branch currently includes:
- reusable reduced-motion-aware reveal primitive
- reusable subtle drift primitive
- reusable progressive route-trace primitive
- progressive route motifs on Home and Live Event
- staged Capture → Build → Relive onboarding transitions
- staged Story Ready reveal
- staged Relive editorial reveal
- progressive Route Replay route + media/label appearance
- restrained live-state pulse

## Acceptance

Motion is accepted only after checking:
- compact phone
- Fold closed
- Fold open / wide
- Android reduced-motion enabled
- transitions do not block taps
- no clipping during animation
- no frame drops on media-heavy story surfaces
- Route Replay remains understandable with animation disabled
