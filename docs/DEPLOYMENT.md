# Ambler deployment

This is the shortest production deployment path once the repository is on GitHub.

## 1. Supabase

Install/login to the Supabase CLI, then from the repository root:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy generate-storybook
supabase functions deploy public-story --no-verify-jwt
```

In **Supabase Dashboard → Authentication → Providers**, enable **Anonymous Sign-Ins** for QR/browser guests.

Set the production app environment values used by Expo/EAS:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
EXPO_PUBLIC_APP_URL=https://YOUR_AMBLER_WEB_DOMAIN
```

Keep the service-role key only in Supabase Edge Function secrets/server configuration. Never place it in Expo public environment variables.

## 2. Web

```bash
npm install --no-audit --no-fund
npm run build:web
```

Deploy `dist-web/` to a host that rewrites unknown routes to the app entry point so `/join/<code>` and `/share/<token>` work when opened directly.

## 3. Android

GitHub CI creates a debug APK on every push once source/type checks pass. For local verification:

```bash
npm install --no-audit --no-fund
npx expo install --check
npm test
npm run typecheck
cd android
./gradlew assembleDebug --no-daemon
```

For Play production, create/confirm the Ambler EAS project and credentials, then build an AAB with the production environment configured.

## 4. Acceptance smoke test

Run one event all the way through:

1. organiser creates an event;
2. guest opens QR/link in a logged-out browser;
3. guest joins by name and uploads media + a note;
4. organiser sees/moderates the contribution;
5. organiser ends the event and generates a story;
6. **Your Story Is Ready** appears;
7. organiser edits and saves;
8. private share link opens in a separate logged-out browser;
9. revoke/expire the share link and verify access stops;
10. permanently delete the test event and confirm private media is purged.
