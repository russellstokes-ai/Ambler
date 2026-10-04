# Ambler App Icon — Current Production Direction

## Current mark

Ambler now uses the brand assets under `assets/brand/`:

- `ambler-icon.png` — square launcher/store source
- `ambler-mark-transparent.png` — transparent foreground/splash mark

The mark is a bold white trail / abstract **A** with waypoint nodes over Ambler violet. It is intended to communicate a route, shared journey and story rather than a generic camera or social-feed icon.

## Brand palette

- Ambler violet: `#5B2CFF`
- Soft white: `#F8FAFC`
- Deep ink: `#18122B`
- Supporting coral/gold accents remain available inside the app, but the launcher mark should stay simple.

## Android adaptive icon

`app.json` already configures:

```json
{
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/brand/ambler-mark-transparent.png",
      "backgroundColor": "#5B2CFF"
    }
  }
}
```

Before Play submission, verify the generated icon under circular, squircle and rounded-square masks and confirm that the waypoint nodes remain within the adaptive-icon safe area.

## Play Store export

- 512 × 512 PNG
- sRGB
- no promotional text, pricing or badges
- compare at 48 px as well as full size

The current asset is a functional brand source; final visual approval is still a release checklist item rather than an engineering blocker.
