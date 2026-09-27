# Verification — September 27, 2026

- `npm test`: 30 passed, including original games and the new shape rules.
- Full Chromium campaign: all four rounds, 18 discoveries, strict turns, saved progress, pause/restart cancellation and reduced motion passed.
- Native browser mouse, keyboard and emulated touch: tile reveal, toy dragging, invalid drops and touch cancellation passed.
- Screenshot review: 1440×1000, 390×844, 320×568 and 844×390. All eight tiles fit; no horizontal overflow. Final costume received an additional browser smoke test.
- No browser exceptions or missing game asset responses during these runs.
- Original game code unchanged; new route linked from the original home screen.

Scope: Chromium automation and screenshot inspection, not device-lab Safari testing or child playtesting. Thirty-minute engagement is not established. Device-speech fallback remains; custom voice recordings and a longer authored adventure are not complete.
