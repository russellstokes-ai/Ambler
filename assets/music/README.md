# Ambler soundtrack assets

The repository contains 15 MP3 files so every soundtrack ID resolves and story playback can be exercised during development.

**They are not declared production-cleared. Do not ship them merely because they play.**

`music-manifest.json` is the release source of truth. For each track, replace the development audio if needed and record the real licence/source, then set `productionReady` to `true` only after commercial-use rights are confirmed and retained outside the app bundle.

Run:

```bash
npm run validate:production-assets
```

The production source intentionally bundles no soundtrack audio until a commercially cleared pack is available. Any future track must be listed in `music-manifest.json` with `productionReady=true` and a recorded commercial licence/source before it can ship.
