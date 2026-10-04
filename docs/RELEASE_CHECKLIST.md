# Ambler Release Checklist

This is the production gate for the Android-first Ambler release. A box is only checked when the shipped build and backend configuration match it.

## Source and builds

- [x] Ambler package identity (`com.russellstokes.ambler`) and scheme (`ambler`)
- [x] deterministic source-integrity checker
- [x] story-engine regression tests
- [x] GitHub Actions definitions for source/type checks and Android debug APK
- [ ] clean `npm install` in a networked CI environment; commit the regenerated `package-lock.json` once verified
- [ ] `npm run typecheck` after the clean dependency install
- [ ] Android `assembleDebug` / EAS preview build succeeds
- [ ] Android AAB production build succeeds
- [ ] install and smoke-test the resulting APK/AAB on a physical Android device

## Supabase

- [ ] apply migrations through `008_activity_story_editing.sql`
- [ ] enable anonymous sign-ins for QR guests
- [ ] deploy `generate-storybook`
- [ ] deploy `public-story --no-verify-jwt`
- [ ] set the production public web origin / deep-link environment variables
- [ ] confirm Storage remains private and signed URLs are used
- [ ] test event deletion removes database rows and private media objects

## End-to-end acceptance

- [ ] organiser creates an event and selects an event type/theme
- [ ] guest scans QR/link in a browser without installing Ambler
- [ ] guest joins by name and uploads photo/video + note
- [ ] organiser sees guest contribution and can moderate it
- [ ] optional route capture records distance and route data
- [ ] organiser ends event and chooses Short / Standard / Epic story
- [ ] story generates and shows the **Your Story Is Ready** reveal
- [ ] organiser edits copy/theme/music/media ordering and saves
- [ ] private story link opens in a logged-out browser
- [ ] expired/revoked links stop working
- [ ] PDF/share/export actions work on supported platforms
- [ ] permanent event deletion purges associated private media

## Privacy and safety

- [x] no broad Android media-library read permission required for uploads
- [x] location is optional and foreground/event scoped
- [x] Android backup disabled
- [x] global render crash boundary + scrubbed on-device diagnostics (no remote telemetry)
- [x] organiser media moderation supported
- [x] account deletion is available in-app
- [x] stale invite links stop accepting contributions when ended/cancelled/archived
- [ ] final Privacy Policy contains the real production support contact and legal entity details
- [ ] final Terms contain the real production support contact and legal entity details
- [ ] Play Data Safety answers checked against the exact production build/SDK list
- [ ] Play UGC/content-rating questionnaire completed against the shipped feature set

## Production content

- [x] story engine and music catalogue use consistent track IDs
- [x] production-asset validator added
- [x] no unlicensed/placeholder music is bundled
- [x] `assets/music/music-manifest.json` is the production licensing ledger
- [x] `npm run validate:production-assets` passes with the current silent production bundle
- [ ] final app icon, splash and Play Store feature graphic visually approved

## Store submission

- [ ] create/confirm Ambler EAS project (`eas init`) and production credentials
- [ ] Play Console application created with package `com.russellstokes.ambler`
- [ ] store icon, feature graphic and screenshots uploaded
- [ ] store copy checked against the actual build
- [ ] privacy-policy URL published
- [ ] support email / support URL published
- [ ] internal-test track completed before production rollout

## Automated commands

```bash
npm install --no-audit --no-fund
npx expo install --check
npm test
npm run typecheck
npm run validate:production-assets
cd android && ./gradlew assembleDebug
```

For a release candidate, use `npm run release:check`. The current production source ships without soundtrack audio, so the production-asset gate passes without bundling unlicensed music.
