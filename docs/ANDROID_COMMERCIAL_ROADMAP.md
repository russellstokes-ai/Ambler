# Ambler Android Commercial Roadmap

## Implemented foundation

- Expo Router / React Native Android-first application
- Supabase account auth plus anonymous QR guest sessions
- event creation/editing, invite QR/link and organiser controls
- private photo/video upload and gallery
- reactions, notes/captions and organiser moderation
- optional route capture with distance, movement and available elevation metrics
- 52 event types, 14 narrative families and deterministic content variation
- short / standard / epic story planning
- deterministic curation, timeline, route, factual insights, themes and music selection
- server-side story generation with organiser authorization
- cinematic **Your Story Is Ready** reveal
- story editing, section regeneration, media promotion/removal and theme/music controls
- private browser story links with refreshed signed media URLs
- PDF / print-layout export foundation
- archive and permanent event deletion
- source/engine tests and GitHub Actions definitions

## Release verification remaining

The source implementation is substantially complete. Release now depends on environment and production-content verification rather than another feature phase:

1. apply Supabase migrations and deploy both Edge Functions;
2. run a clean networked dependency install, semantic TypeScript check and Android build;
3. test one complete real event from QR upload through shared story;
4. optionally add a commercially cleared music pack later; the current production bundle intentionally ships silent and already passes the asset gate;
5. supply final legal/support contact details and confirm Play Data Safety/UGC declarations;
6. create the Ambler EAS/Play production project and run internal testing.

See `RELEASE_CHECKLIST.md` for the acceptance gate.
