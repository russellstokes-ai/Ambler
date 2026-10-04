# Ambler Google Play Data Safety Form Draft

Use this document as the working answer sheet for the Google Play Data Safety section. The final Play Console answers must match the shipped app, SDKs, backend configuration, and enabled features at submission time.

## App-Level Declarations

- Data is collected by the app: Yes
- Data is shared with third parties: Yes, for service providers needed to operate the app
- Data is encrypted in transit: Yes, use HTTPS/TLS for app, Supabase, and auth provider communication
- Users can request data deletion: Yes
- Account creation is supported: Yes
- Users can request account deletion: Yes, through in-app controls when available or by contacting support
- Ads: No
- Health data collected: No
- Financial data collected: No
- Government IDs collected: No

## Third-Party Services and Processors

- Supabase: authentication, database, storage, and backend processing
- Expo: app runtime modules, auth session flow, image picker, location, file system, and build tooling
- Google: Google sign-in where enabled
- Facebook: Facebook sign-in where enabled
- Apple: Apple sign-in where enabled

If analytics, crash reporting, payments, maps, messaging, or support SDKs are added later, update this document and the Play Console form before release. The current release-candidate source does **not** transmit the local crash diagnostic ring buffer to a third party.

## Data Types Collected

| Data type | Play category | Collected? | Shared? | Purpose | Encrypted in transit? | User can request deletion? | Notes |
|---|---|---:|---:|---|---:|---:|---|
| Photos | Photos and videos | Yes | Yes | App functionality: event gallery, storybooks, shared event viewing | Yes | Yes | User-selected media only |
| Videos | Photos and videos | Yes | Yes | App functionality: event gallery, storybooks, shared event viewing | Yes | Yes | User-selected media only |
| Location | Location | Optional | Yes | App functionality: event route, stops, map moments, event context | Yes | Yes | Event-only and opt-in; may include approximate or precise location |
| Email address | Personal info | Yes | Yes | Account management, authentication, support, security | Yes | Yes | From OAuth or Supabase Auth |
| Display name | Personal info | Yes | Yes | Profile, event membership, attribution inside shared events | Yes | Yes | From OAuth, profile setup, or account settings |
| Profile avatar | Personal info | Optional | Yes | Profile display, event membership, attribution inside shared events | Yes | Yes | From OAuth or user upload |
| Event details | App activity | Yes | Yes | Event creation, event membership, storybook creation | Yes | Yes | Event name, type, date, theme, participants |
| Captions, comments, reactions | App activity | Optional | Yes | Shared event interaction and storybook display | Yes | Yes | User-entered content |
| Device diagnostics | App info and performance | No (current build) | No | Local reliability diagnostics only | N/A | User clears with app data/account lifecycle | Current crash boundary stores a small scrubbed error log on-device; no remote crash SDK is configured |

## Per-Data-Type Answers

### Photos and Videos

- Collected: Yes, when users select media for an event
- Shared: Yes, with Supabase and with invited event participants or active storybook link viewers
- Purpose: App functionality
- Required or optional: Required for media-based storybooks; each upload is user selected
- Processed ephemerally: No, selected media may be stored for event and storybook access
- Encrypted in transit: Yes
- Users can request deletion: Yes

### Location

- Collected: Optional, only when the user enables route capture for an event
- Shared: Yes, with Supabase and with invited event participants or active storybook link viewers
- Purpose: App functionality
- Required or optional: Optional
- Processed ephemerally: No, route records may be stored for event and storybook access
- Encrypted in transit: Yes
- Users can request deletion: Yes
- Play Console note: Declare approximate and precise location if both are requested by the shipped app

### Email Address

- Collected: Yes, when users create or use an account
- Shared: Yes, with authentication and backend service providers
- Purpose: Account management, authentication, security, support
- Required or optional: Required for account-based features
- Processed ephemerally: No
- Encrypted in transit: Yes
- Users can request deletion: Yes

### Display Name

- Collected: Yes
- Shared: Yes, with authentication and backend service providers and with event participants where shown in the app
- Purpose: App functionality, account management
- Required or optional: Required or optional depending on sign-in provider and profile setup
- Processed ephemerally: No
- Encrypted in transit: Yes
- Users can request deletion: Yes

### Profile Avatar

- Collected: Optional
- Shared: Yes, with backend service providers and with event participants where shown in the app
- Purpose: App functionality and profile display
- Required or optional: Optional
- Processed ephemerally: No
- Encrypted in transit: Yes
- Users can request deletion: Yes

## Permissions and Policy Notes

### Photos and Videos

Ambler should use `expo-image-picker` and the Android system photo picker where available. This lets users select specific photos or videos and avoids declaring broad `READ_MEDIA_IMAGES` or `READ_MEDIA_VIDEO` access as a core app permission.

Before store submission, remove broad media permissions from `app.json` unless there is a documented product need and a matching Play Console permission declaration.

### Location

Location must be opt-in and event-only. The app should show a prominent disclosure before the system permission request, explaining that location is used to create routes, stops, and map moments for the selected event.

### Camera

If the camera is enabled, declare camera permission and explain that it is used to capture event media. If the app only imports existing media through the system picker, remove camera permission before submission.

## Explicit Non-Collection Declarations

- Health and fitness data: Not collected
- Financial information: Not collected
- Payment information: Not collected
- Credit history: Not collected
- Government identifiers: Not collected
- Contacts: Not collected unless a future invite feature explicitly requests contacts and updates this document
- Calendar data: Not collected
- SMS or call logs: Not collected
- Files and documents outside selected media: Not collected

## Deletion Request Language

Suggested support response text:

"Ambler provides in-app account deletion under Privacy & Data. Before store release, also publish the real production support contact for users who cannot access the app. Do not submit the Play form until that contact and the shipped backend deletion flow are verified."
