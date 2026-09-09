# Pip's Garden — Flip & Grow

A complete, standalone storybook memory game in **Brainmatch-exp only**. This is not a shared dependency of the ten production games. No production analytics, progress bridges, storage or repositories are changed.

## Play

Serve the repository with `npm start`, then open http://127.0.0.1:4178. Node 20+ is recommended. No dependencies or build step are required. The root `index.html` and relative module/asset URLs work on GitHub Pages, including a repository subpath.

The child taps Play, completes a mandatory guided match, then travels through six gardens. Each new board introduces its pairs individually and lets the child study the full board before hiding it. There is no time pressure.

- Original vector storybook world, expressive Pip character and illustrated cards; no emoji placeholders or copied reference art.
- Visual hand-pointer tutorial with disabled off-target cards.
- Short Hindi prompts and replayable narration. Speech is synthesized by an installed Hindi **device/browser voice**, at a gentle rate and slightly raised pitch. Voice availability and quality vary; this is **not a custom recorded or cloned character voice**. A device without Hindi speech still has complete visual guidance.
- Soft original synthesized chimes, mute, pause, keyboard controls and reduced-motion support.
- One free preview per attempt. After two wrong matches, Pip points to the matching partner when a card is chosen.
- Sequential unlocks, a collected-friends garden, per-level replay and best-result scoring.
- Pausable/cancellable turn timers and saved partial boards prevent stale callbacks crossing levels.
- No ads, purchases, account, network analytics or application backend. Font is local; speech synthesis may be implemented by the browser/OS.

## Scoring

One turn means selecting two cards. Perfect turns equal the number of pairs.

| Garden | Pairs / perfect turns | 3 stars / max XP | 2 stars (up to 2 extra turns) | 1 star (3+ extra turns) |
| --- | ---: | ---: | ---: | ---: |
| Shape Meadow | 2 | 15 | 12 | 9 |
| Counting Pond | 3 | 20 | 16 | 12 |
| Little Growers | 4 | 30 | 24 | 18 |
| Weather Woods | 4 | 35 | 28 | 21 |
| Rupee Market | 5 | 45 | 36 | 27 |
| Wonder Workshop | 6 | 55 | 44 | 33 |
| **Total** | **24** | **200** | **160** | **120** |

Each result shows **earned / level maximum XP**. The final garden sums the best result from each level. Worse replays do not reduce the garden total, and repeated rewards are never added twice. Hints do not subtract hidden penalties.

The single source of reward truth is `game-data.js`. Storage key: `brainmatch-exp:pip-storybook:v1`. Loading recomputes rewards from valid turn counts, validates saved decks and enforces sequential unlocks. Reset is behind settings and a confirmation, and affects this game's key only.

## Files and verification

- `art.js`: original SVG world, character, card illustrations and controls.
- `game-data.js`: chapters, reward calculation, save validation.
- `script.js`: tutorial, game states, input, progression and UI.
- `clock.js`: pause/resume/cancel-safe feedback timer.
- `voice.js`: Hindi device narration.
- `tests/`: `npm test` verifies reward boundaries, full campaigns, replay accounting, shuffled decks, save validation and timer safety.

Baloo 2 is included under the SIL Open Font License in `assets/OFL.txt`. All other visuals and chimes are original code-native assets. Rupee coins are stylized learning illustrations, not banknote scans.

## Hosting

Push the root files to the experimental repository. If GitHub Pages is configured to deploy from `main` / root, GitHub publishes the game automatically after that deployment succeeds. This project itself does not alter repository hosting settings.
