# Ambler UI Sprint 1 — Design System + App Shell

Status: design specification complete
Updated: 2026-10-07

## Brand foundation

Reuse the existing Ambler product palette:
- Ambler Violet: #5B2CFF
- Night: #0F062C
- Ink: #18122B
- Pink: #EC3FA4
- Aqua: #18C7D5
- Soft: #F7F4FF
- Cream: #FFF9F2
- Success: #19C37D
- Warning: #FFB020

Launcher mark remains the white route/A mark over Ambler Violet.

## Base app visual language

The app shell should be calmer than the story themes:
- deep ink/night surfaces in dark mode
- soft/cream surfaces in light mode
- Ambler Violet as primary action color
- pink/aqua used sparingly for motion, status and celebratory accents
- generous whitespace
- minimal borders
- shadows only where hierarchy needs them
- avoid card soup

Story themes may be expressive. Core navigation and settings should remain recognisably Ambler.

## Typography

Prototype default:
- system / Inter-style sans
- display: 32–40, heavy
- section: 22–26, bold
- card title: 17–20, semibold
- body: 15–17
- caption/meta: 12–14
- minimum interactive label target: 14

Wide layouts retain readable line lengths instead of scaling type aggressively.

## Spacing grid

Base 4 dp rhythm:
- 4 micro
- 8 tight
- 12 control
- 16 standard
- 20 content gutter
- 24 section
- 32 major section
- 48 hero separation

## Radius

Use existing intent:
- 12 small
- 20 medium
- 30 large
- 40 hero/sheet

Do not apply rounded containers indiscriminately.

## Core components

Draftbit reusable components:
- AmblerHeader
- PrimaryButton
- SecondaryButton
- IconButton
- CreateFAB
- BottomNav
- StoryCover
- EventRow
- EventHero
- PersonAvatar
- MediaTile
- UploadProgress
- StatusPill
- StorageBadge
- EmptyState
- ErrorState
- InlineRetry
- BottomSheet
- ConfirmationSheet
- SegmentedControl
- ThemePreview
- ServerStatus

## Navigation

Bottom navigation:
- Home
- Events
- Stories
- Profile

Central floating Create button sits visually above the nav, aligned and safe-area aware.

Rules:
- no page content hidden behind nav
- selected state uses violet + label emphasis
- no animation that shifts navigation geometry
- Fold-open may move to a left rail if that improves balance, but route names/order remain unchanged

## Motion

Core shell:
- 180–260 ms utility transitions
- 320–500 ms modal/reveal motion
- story surfaces may use longer theme-specific timing
- reduced-motion mode removes scale/parallax and keeps opacity/simple translation

Never animate layout in ways that create doubled text, ghost layers or control flicker.

## Accessibility

- minimum 44x44 touch targets
- 4.5:1 text contrast where practical
- dynamic text must not clip primary actions
- never encode status only by color
- reduced motion
- clear focus states on web
- media needs accessible labels

## Sprint 1 acceptance

- reusable token set defined
- bottom navigation and create action defined
- dark/light shell defined
- compact/fold responsive rules defined
- no screen-specific visual decisions contradict the shared system
