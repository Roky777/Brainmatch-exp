# Verification — September 27, 2026

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
