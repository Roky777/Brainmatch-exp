# Verification — September 27, 2026

## September 28 — current Shape Friends scenes and kimono animation

- Home, mode-specific level selection, play, pause and result are separate scenes. The root route opens Shape Friends; Pip is not linked in the active route, while its source and save key remain untouched.
- The supplied kimono sheets are packaged into four expression/reach/reaction/peek WebP atlases plus sleeve and glove cutouts. Sparky's turn animates his arm toward each chosen card before its reveal. A deterministic browser check captures the reaching state and verifies a nonzero sleeve span.
- Browser screenshots were reviewed at 320×568, 375×669, 390×844, 667×375, 844×390, 1024×768, 1440×1000 and 1920×1080. The home peek reaches the right edge on narrow phones, and its caption stays onscreen. Levels and cards remain within the viewport.
- `npm test` covers 38 logic tests. Full Chromium QA completes all six Practice/Beat Sparky × 4/6/8-card combinations and checks keyboard/touch, pause, local audio decode/playback, cancellation, reduced motion, and no missing assets or browser exceptions.
- Not yet certified: Safari/device-lab behavior, young-child usability, 30-minute engagement, and perceptual approval of the generated voice acting. The current background and character sheets are AI-generated/supplied art, not hand-painted production illustration.

Older entries below document superseded iterations.

## September 28 — dream theme, mode menus and match-earned turns

- 38 unit tests passed, including extra turns for both players, all score outcomes and bounded observed-only Sparky memory. Original Pip/Barnyard rules remain unchanged.
- Chromium completed all six Practice/Beat Sparky × 4/6/8-card combinations. Checked phone, small landscape and desktop bounds, keyboard menu selection, touch reveal, home cancellation, pause and reduced motion. No browser exceptions or missing assets.
- All 21 local voice clips decoded; intro playback advanced. Acting quality has not been perceptually approved.
- Reviewed home, separate levels and gameplay screenshots. Home places animated Sparky beside the mode menu. Gameplay removes the collection shelf and level selectors.
- Fixed a selector collision between app datasets and mode/level buttons. Button selection now explicitly targets buttons.
- Foreground repaint was blocked by image-generation usage limits. Current art uses a top-aligned crop, not a newly painted grass removal. Existing Sparky face/atlases remain; colour filtering and grounding shadow are presentation adjustments only.

The entries below describe earlier iterations, not the current active theme.

## September 28 — calmer painted background and grouped layout

- Active scenery is the simplified `calm-meadow-v2.webp`, not the rejected dense orchard. Desktop, portrait and small-landscape screenshots inspected behind live cards.
- Board, shelf and coach now share a flow-based layout. Browser bounds assertions check separate basket/object/hint slots, coach below shelf, and no sprite/dialogue overlap at six viewport sizes.
- 34 unit tests passed. Final full Chromium campaign passed all four rounds, 18 discoveries, persistence, mouse/touch interaction, keyboard controls, sprite pause/reduced motion and voice playback, with no browser exceptions or missing assets.
- An intermediate run began before the orchard conversion completed and reported missing images; the final run above started with the selected meadow file installed and passed.

## Clean Pip-inspired / local voice follow-up

The original Pip lesson was opened and screenshot-reviewed before adapting its existing world art, simpler cards and smaller coach composition. Eight generated English voice cues ship locally. These are initial voice candidates, not perceptually approved custom character recordings. Remaining dynamic narration retains device fallback.

- 34 unit tests passed; all eight local MP3s decoded in Chromium and welcome playback advanced at normal playback rate.
- Full four-round browser campaign passed with 18 discoveries, saved-progress restoration, mouse/touch interaction, pause, keyboard controls and reduced motion; no browser exceptions or missing assets.
- Desktop and phone screenshots reviewed. The persistence test now uses the visible collection basket, not the retired toolbar shortcut.

## Board-first tabletop follow-up

- 32 unit tests and all four browser-played rounds passed, including discoveries, saved progress, mouse/touch interaction and reduced motion.
- Desktop and phone screenshots reviewed: enlarged inset board, rim progress and attached discovery drawer; Sparky remains outside the card hit areas.
- Added regression checks for card containment, zero gap between board and drawer, and the actual hint-button hit target at six screen sizes.
- No new generated tabletop asset: image-generation usage was exhausted; existing painted edging was reused.

## Playful courtyard / sprite animation follow-up

- 32 unit tests passed, including atlas frame selection, multi-frame clips, shared bottom alignment and reduced-motion stills.
- Additional browser checks observed at least three distinct greeting frames after tapping Sparky, unchanged frames while paused, and a stable frame under reduced motion.
- Screenshot-reviewed the new courtyard and tiles at desktop and small landscape sizes. The sprite hit area is placed beside, not over, the matching board.
- Full foreground browser campaign passed all four rounds, 18 discoveries, mouse/touch drag, cancellation, keyboard alternatives, persistence and reduced motion with no exceptions or missing assets. An earlier parallel run timed out after another QA tab hid it; the single-foreground rerun passed.

- `npm test`: 30 passed, including original games and the new shape rules.
- Full Chromium campaign: all four rounds, 18 discoveries, strict turns, saved progress, pause/restart cancellation and reduced motion passed.
- Native browser mouse, keyboard and emulated touch: tile reveal, toy dragging, invalid drops and touch cancellation passed.
- Screenshot review: 1440×1000, 390×844, 320×568 and 844×390. All eight tiles fit; no horizontal overflow. Final costume received an additional browser smoke test.
- No browser exceptions or missing game asset responses during these runs.
- Original game code unchanged; new route linked from the original home screen.

Scope: Chromium automation and screenshot inspection, not device-lab Safari testing or child playtesting. Thirty-minute engagement is not established. Device-speech fallback remains; custom voice recordings and a longer authored adventure are not complete.

## Landscape-first follow-up

- 30 unit tests passed again.
- Browser smoke checks passed at 390×844, 320×568, 844×390, 667×375, 1024×768, 1440×1000 and 1920×1080.
- Explicitly revealed the unlocked basket shortcut during layout tests: toolbar controls, hint and dialogue do not intersect the matching board.
- Portrait suggestion is dismissible. Rotating portrait → landscape with one card revealed preserves that card and turn.
- Screenshot-reviewed small landscape composition. No browser exceptions or missing assets in the follow-up run.
