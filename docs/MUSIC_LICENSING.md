# Ambler music licensing gate

The production source currently ships **without bundled soundtrack audio**. This is deliberate: no demo or placeholder MP3 is permitted into a store build.

`assets/music/music-manifest.json` is the release ledger. A track may be added only when:

1. the audio file is present under `assets/music/`;
2. `productionReady` is `true`; and
3. the `license` field records the commercial licence/source used for Ambler.

`npm run validate:production-assets` fails if it finds an unlisted MP3, a missing listed file, or a listed track without production clearance. With no soundtrack files bundled, the gate passes and Ambler runs silently.

The story engine keeps deterministic soundtrack recommendations as metadata so a cleared production music pack can be added later without redesigning story generation. Playback controls and music choices are hidden unless a playable bundled asset exists.
