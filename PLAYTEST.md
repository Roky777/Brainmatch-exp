# Playtest — storybook release

## Automated

`npm test`: 10 passing tests. Covered all chapter reward boundaries, 200/160/120 campaign totals, replay improvement-only accounting, malformed saves, sequential unlocks, shuffle integrity and pause/cancel timer safety.

## Browser playthrough

Tested through normal game buttons in Chrome; no game-state injection.

- Completed all required tutorial steps: only the target card accepts input; partner is demonstrated before the first real board.
- Played all six chapters perfectly: **15/15, 20/20, 30/30, 35/35, 45/45, 55/55 XP**, each with 3 stars.
- Final garden: **200/200 XP**.
- Replayed the first chapter with three mistakes: **9/15 XP, 1 star**. Best garden remained **200/200**, added XP was **0**.
- Two mismatches enabled the visual matching-partner hand.
- Paused during mismatch feedback: cards remained open until Resume; the timer completed afterwards.
- Reloaded a partial board: the same matched cards and turn count resumed; the tutorial did not repeat.
- Used the free peek: cards revealed temporarily, then hid; the peek button could not be reused.
- No captured browser console errors.

## Visual review

Reviewed title scene, guided pair introduction, card faces, rupee values, map and reward surfaces at desktop, 375×667 and 320×568.

Adjusted the eight-card mobile board to larger, three-across cards with a centred final row. Reduced the largest board on short phones so the coach and action remain visible. Note images and number labels remain contained in cards.

## Known voice limitation

Hindi text and narration integration are present, with a local-device voice fallback. This release does not include a custom recorded Hindi voice. Voice timbre and availability depend on the browser/OS; audible quality was not independently certified. All tutorial steps and hints also work visually.
