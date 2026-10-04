You are improving the Ambler v2 Android scaffold.

Read these first:
- README.md
- docs/STORYBOOK_QUALITY_STANDARD.md
- docs/ANDROID_COMMERCIAL_ROADMAP.md
- src/features/storybook/storybookEngine.ts
- src/components/storybook/StorybookPager.tsx
- src/features/auth/authService.ts
- supabase/migrations/001_initial_schema.sql

Core instruction:
The storybook quality is the key selling point. Improve the app as a premium storybook product first. Auth, events, media upload and route capture exist to support the storybook.

Next task:
1. Improve the StorybookPager into a more commercial-grade swipeable experience.
2. Add separate reusable page components for:
   - Cover
   - Cinematic Opening
   - Timeline
   - Route Replay
   - Hero Gallery
   - Story Insights
   - Friend Captions
   - Share
3. Add animation using Reanimated where appropriate.
4. Keep the first demo event as “Your Weekend Loop”.
5. Keep the UI language focused on storybooks, memories and route replay.
6. Add quality score display for internal/debug use only, not as a consumer-facing headline.
7. Preserve Android-first assumptions.
8. Keep Google, Facebook and Apple ID auth requirements.

After finishing:
- List files changed.
- Explain how to run the app.
- Explain how the storybook quality improved.
- Recommend the next 3 milestones.


Additional positioning rule:
Ambler is for all events. Do not make the UI, data model or onboarding feel specific to birthdays, trips, weddings, stag/hen parties, festivals or nights out. Those should be selectable templates only. The core product is: any event becomes a premium storybook.


Additional event/theme requirement:
Expand the create-event and storybook generation flow around the new event/theme matrix. Cover road trips, gender reveals, baby showers, proposals and engagement parties as first-class event templates, alongside birthdays, weddings, stag/hen, festivals, group holidays, family gatherings and custom events.

Important:
Every event type must have multiple recommended themes.
Themes must be interchangeable and reusable.
Do not build separate hard-coded storybook engines per event type.
