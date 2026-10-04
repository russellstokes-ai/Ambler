# Ambler Event Coverage and Theme System

Ambler is for **all events**. The app must not feel limited to birthdays, weddings, nights out or travel.

The core promise remains:

**Any event becomes a premium storybook.**

Event types are used for:
- suggested storybook structure
- theme recommendations
- default prompts/captions
- iconography
- share card style
- route/timeline emphasis
- privacy defaults

They must not limit what a user can create.

---

# Event types to support

## Social and celebration
- Birthday
- House party
- Dinner party
- Night out
- Weekend away
- Festival
- Graduation
- Reunion
- Work social
- Team event
- Sports trip
- Private party
- Family gathering
- Anniversary

## Travel and movement
- Road trip
- Group holiday
- City break
- Backpacking trip
- Cruise
- Ski trip
- Camping trip
- Hiking day
- Beach day
- Theme park day
- Match day / away day
- Day trip

## Life moments
- Proposal
- Engagement party
- Wedding
- Stag party
- Hen party
- Baby shower
- Gender reveal
- Christening / naming day
- New home party
- Leaving party
- Retirement party

## Community and organised events
- School event
- University event
- Club event
- Charity event
- Meetup
- Conference social
- Brand event
- Launch party
- Creator meet-up

---

# Storybook theme system

A theme is not only colours. A theme controls:

1. Layout
2. Typography
3. Motion style
4. Captions tone
5. Route/map styling
6. Timeline style
7. Highlight selection emphasis
8. Share card design
9. Cover page treatment
10. Story Insights presentation

Each event type can recommend multiple themes, and users can override them.

---

# Universal themes

These should work for any event:

## 1. Cinematic
Premium, emotional, full-bleed photos, dramatic cover, minimal text.

## 2. Social Story
Snap-style, stickers, reactions, quick captions, vertical swipe energy.

## 3. Wrapped
Spotify Wrapped-style recap with bold stats, playful cards and shareable insights.

## 4. Route Replay
Strava-inspired map-first layout, route line, photo pins, stops, distance and time.

## 5. Luxe
Premium black, soft gold, clean editorial pages, perfect for weddings, engagements, dinners and luxury trips.

## 6. Retro Film
Disposable camera feel, grain, date stamps, Polaroid frames, warm nostalgia.

## 7. Magazine
Editorial spreads, big headlines, quote pulls, feature-page style.

## 8. Chaos Mode
Funny, energetic, meme-ish, “what just happened?” recap for nights out, parties and festivals.

## 9. Family Keepsake
Soft, warm, safe, sentimental, simple captions, good for family and baby events.

## 10. Minimal
Clean, Apple-like, white space, polished layout, low noise.

---

# Event-specific recommended themes

## Road trip
Recommended:
- Route Replay
- Cinematic
- Retro Film
- Magazine
- Wrapped

Key storybook pages:
- Route map
- Stops visited
- Distance covered
- Time on the road
- Best roadside moment
- Playlist/quote page later
- Photo pins at stops

## Gender reveal
Recommended:
- Family Keepsake
- Cinematic
- Wrapped
- Minimal
- Social Story

Key storybook pages:
- Build-up timeline
- The reveal moment
- Reactions gallery
- Family messages
- Colour-themed share card
- Guest predictions later

Important:
Avoid assuming gender language beyond what users enter.

## Baby shower
Recommended:
- Family Keepsake
- Luxe
- Minimal
- Magazine
- Retro Film

Key storybook pages:
- Guest arrival
- Gift table
- Games
- Family/friends messages
- Wishes for baby
- Keepsake export

## Proposal
Recommended:
- Cinematic
- Luxe
- Minimal
- Magazine
- Retro Film

Key storybook pages:
- Before the moment
- The proposal
- Reaction shots
- Route/place memory
- Messages from friends/family
- Engagement announcement card

Privacy default should be stricter because proposal storybooks may be shared selectively.

## Engagement party
Recommended:
- Luxe
- Cinematic
- Magazine
- Social Story
- Wrapped

Key storybook pages:
- Couple cover
- Guest moments
- Toasts/speeches
- Route/place memory
- Best group photos
- Share announcement

## Wedding
Recommended:
- Luxe
- Cinematic
- Magazine
- Family Keepsake
- Minimal

Key storybook pages:
- Ceremony
- Reception
- Speeches
- First dance
- Guest messages
- Timeline of the day
- Print-ready export later

## Stag / Hen
Recommended:
- Chaos Mode
- Social Story
- Route Replay
- Wrapped
- Retro Film

Key storybook pages:
- Route Replay
- Awards
- Funniest moment
- Group photos
- Best quote
- Share-safe version

Add “share-safe edit” mode to remove sensitive photos before sharing.

## Birthday
Recommended:
- Social Story
- Wrapped
- Cinematic
- Retro Film
- Chaos Mode

Key storybook pages:
- Arrival
- Cake/toasts
- Best group moments
- Messages
- Birthday recap stats

## Festival
Recommended:
- Social Story
- Route Replay
- Wrapped
- Retro Film
- Chaos Mode

Key storybook pages:
- Acts/stages
- Route between areas
- Peak moment
- Group shots
- Night recap

## Work social / corporate social
Recommended:
- Minimal
- Magazine
- Luxe
- Cinematic

Key storybook pages:
- Venue
- People
- Key moments
- Team highlights
- Share-safe export

---

# Theme selection flow

When creating an event:

1. User chooses event name.
2. User optionally chooses event type.
3. App suggests 3–5 themes.
4. User can preview themes using sample storybook pages.
5. User can change theme after the event before sharing.

Example:
Event type: Road trip
Suggested themes:
- Route Replay
- Cinematic
- Retro Film
- Wrapped

Example:
Event type: Proposal
Suggested themes:
- Cinematic
- Luxe
- Minimal
- Retro Film

Example:
Event type: Stag party
Suggested themes:
- Chaos Mode
- Route Replay
- Wrapped
- Social Story

---

# Product rule

Do not hard-code event types into the storybook engine.

The engine should accept:
- event type
- selected theme
- media
- timeline data
- route data
- captions/comments
- privacy settings

Then generate a storybook based on the selected theme template.

---

# Commercial opportunity

Premium monetisation can come from themes:

Free:
- Social Story
- Minimal
- Basic Route Replay

Premium:
- Cinematic
- Luxe
- Retro Film
- Magazine
- Wrapped
- Family Keepsake
- Chaos Mode
- Print-ready Wedding / Proposal / Baby Shower templates

