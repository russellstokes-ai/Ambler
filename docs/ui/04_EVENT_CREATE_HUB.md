# Ambler UI Sprint 4 — Create Event + Live Event Hub

Status: design specification complete
Updated: 2026-10-07

## 9. Create Event — Basics

Purpose: create an event quickly without feeling like a form.

Fields:
- Event name
- Date/time
- Optional end date/time
- Optional location
- Optional short description

Primary action: Continue.

Validation is inline. Invalid dates never close the flow or erase entered data.

## 10. Event Type

Default view:
- Popular
- Travel
- Activities
- Celebrations
- Family & Life
- Community
- All

The full existing event taxonomy remains available, but the user should never be confronted with a wall of 52 equal choices.

Search is available.

Each choice shows:
- icon
- label
- one-line description

Selecting an event type immediately previews recommended story styles.

## 11. Story Style / Theme

Show recommended themes first.

Theme tile:
- real preview composition
- theme name
- short mood description
- subtle motion preview where practical

Avoid technical terms such as “preset”.

Allow “Choose later”.

## 12. Privacy + Route

Privacy:
- Private — invited people only
- Shared by private link
- Public only where the event type and user intentionally choose it

Route:
- Record this event’s route
- explanation of what is captured
- privacy note for start/end redaction

Advanced storage is not configured here. New events inherit the user's storage default.

## 13. Invite / QR

After creation, land on a celebratory invite page.

Hero:
- event title
- date
- small theme treatment

Invite methods:
- QR code
- Copy link
- Share

Secondary:
- “Do this later”
- invite status / participant count

## 14. Live Event Hub

This is the operational heart of a live event.

Hero:
- event cover/theme
- Live / Upcoming state
- title, location, time
- organiser indicator

Core modules:
- Moments count
- People count
- Route status
- Notes count

Primary live action:
- Add Moment

Secondary actions:
- View Moments
- Route
- Invite People
- Add Note

Organiser-only:
- Finish Event / Build Story
- edit event
- participant moderation

Do not show completed-story controls while the event is still live.

## Live-state motion

New contributions can softly animate into counts/gallery previews.
No uncontrolled pulsing.
No layout movement when counts change.

## Fold-open

Use a two-pane Event Hub:
- left: event hero/live status/primary action
- right: moments, people, route, notes

## Sprint 4 acceptance

- event can be created through a short, coherent flow
- 52 event types remain accessible without overwhelming users
- theme selection is visual
- privacy/route choices are understandable
- invite is immediate
- live Event Hub clearly prioritises capture
