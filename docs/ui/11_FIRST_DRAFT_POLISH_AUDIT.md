# Ambler UI — First Draft Polish Audit

Updated: 2026-10-07
Branch: `ui/draftbit-first-pass`

## Purpose

This document records the second-pass quality review of the 36-screen Ambler UI prototype.

The goal was to remove the common signs of a rushed prototype before owner review.

## Improvements completed

### Brand fidelity
- replaced the generic splash symbol with the real Ambler transparent brand mark
- added branded lockup treatment to onboarding
- kept expressive story themes separate from the calmer core application shell

### Onboarding
- replaced the single placeholder onboarding screen with three real states:
  - Capture
  - Build
  - Relive
- added working Continue progression
- added working Skip
- changed the hero treatment between onboarding stages

### Interaction quality
- event filters are selectable
- story filters are selectable
- story search accepts input
- event categories/types are selectable
- story styles are selectable
- privacy mode is selectable
- route recording can pause/resume
- Moments filters are selectable
- Add Moment media type is selectable
- guest photo/video choice is selectable
- Short / Standard / Epic story length is selectable
- Route Replay play/pause works as a prototype state
- Route Replay explore/resume state works
- Route Replay expanded/full-route state works
- Route Moment details can be shown
- Theme selection works
- soundtrack play/pause state works
- private share link can be revoked/recreated
- save/export choices provide visible completion state
- Home Server default destination is selectable
- connection test/sync states are represented
- server QR/manual setup choices are represented

### Dead-control audit
A source scan was performed after the interaction pass.

Result:
- Pressable controls without `onPress`: **0**
- Primary buttons without `onPress`: **0**
- Secondary buttons without `onPress`: **0**

### Affordance cleanup
- informational rows no longer automatically show navigation chevrons
- navigation chevrons are now reserved for genuinely navigable rows
- Story Editor controls now expose real prototype states
- Share/export rows now behave as actual actions rather than decorative list items

### Responsive polish
- prototype content now has a sensible wide-layout max width
- core two-pane layouts remain available for Fold/tablet widths
- paired actions wrap safely on narrow screens
- paired buttons share space instead of overflowing
- touch targets retain minimum usable sizes

### Visual polish
- pressed-state feedback added to shared primary/secondary controls
- selection states are visible on capture cards, themes and other choices
- story/route menu layers have explicit hierarchy
- long text remains constrained by existing responsive composition

## Quality rules still in force

Do not mark this UI **accepted** from source alone.

Still required:
- web export verification
- Android build verification
- physical phone visual review
- Fold-open visual review
- owner review of all five end-to-end journeys
- corrections based on real rendered output
- Draftbit recreation/implementation
- final UI lock

## Current quality claim

The prototype is now suitable as a **polished first-draft implementation**, not a finished UI.

It should be used as the baseline for visual review and Draftbit recreation, while final acceptance remains evidence-based.
