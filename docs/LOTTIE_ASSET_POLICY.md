# Ambler — Lottie Asset Policy

Updated: 2026-10-07

Ambler uses Lottie selectively. Lottie is for small, self-contained visual feedback moments — not for core navigation, Route Replay geometry, or continuous decorative motion.

## Current approved Lottie uses

1. **Story building**
   - loop while Ambler is genuinely building the story
   - vector-only
   - restrained orbit/card motion

2. **Ambler Home Server discovery**
   - loop only while discovery/search is active
   - radar/ring treatment
   - no fake success state

3. **Completion accent**
   - one-shot check animation
   - used for confirmed completion/success only
   - never loops

## Colour rule

All ordinary Ambler Lottie assets must be easy to recolour to match the UI.

Current utility palette:
- Ambler Violet — `#5B2CFF`
- Ambler Aqua — `#18C7D5`
- White — `#FFFFFF`

Requirements:
- vector-only shapes where practical
- transparent background
- no baked-in raster artwork
- small, intentional colour set
- meaningful layer names
- source JSON kept in `assets/lottie/`
- editable/importable in Lottielab

The current files use named layers such as:
- `Ambler Violet ...`
- `Ambler Aqua ...`
- `Ambler White ...`

Lottielab's **Document Colors** can batch-update the palette if the Ambler UI colours change.

The native Ambler wrapper also exposes colour filters for the same named layers. The source files already use the canonical Ambler colours, so the design remains correct even if a platform-specific colour-filter implementation is imperfect.

## Rewards exception

If Ambler later gains an explicitly approved rewards/achievement system, reward animations are the one exception to the restricted utility palette.

Reward/celebration Lotties may:
- use richer multicolour artwork
- preserve purpose-built colour sequences
- use more expressive celebratory motion

They still must:
- fit the Ambler visual family
- respect reduced motion
- avoid obscuring controls/content
- play only when the user actually earns/completes something
- never be added merely as decoration

**No rewards feature is currently introduced by this policy.**

## Do not use Lottie for

- Route Replay route drawing
- GPS/path interpolation
- map camera movement
- ordinary page transitions
- routine settings/forms
- persistent navigation motion
- long-running background animation unrelated to real state

Those remain native/data-driven so they can respond to real route progress, interaction and accessibility settings.

## Platform behavior

### Android / iOS
Uses `lottie-react-native` with local JSON assets.

### Web
Uses a lightweight matching React Native Animated fallback. This deliberately avoids pulling native Lottie dependencies into the browser bundle while keeping visual parity.

## Accessibility

When the OS requests reduced motion:
- looping Lotties resolve to a static branded state
- completion remains visually understandable without motion
- no information or success state depends on animation

## Current source assets

- `assets/lottie/story-building.json`
- `assets/lottie/server-discovery.json`
- `assets/lottie/completion.json`

These files are suitable for import into Lottielab for further visual tuning.
