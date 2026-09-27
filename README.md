# Pip's Garden — Flip & Grow

A complete, standalone storybook memory game in **Brainmatch-exp only**. This is not a shared dependency of the ten production games. No production analytics, progress bridges, storage or repositories are changed.

The original six-level **Flip & Grow** experience remains intact. The home screen also includes **Barnyard Together**, an additive two-round cooperative mode where the child and Pip alternate turns, discover Cow/Hen/Hay/Egg and Duck/Sheep/Pond/Flowers, and then play with those discoveries in a persistent barnyard. Its fair guide memory, save data, controls, and rules are isolated from the original campaign.

Barnyard Together keeps every spoken line captioned and uses the browser/OS English speech voice as its clearly identified prototype fallback. Voice and music/effects have separate controls, and missing speech never blocks play.

**New: [Shape Friends](shape-friends/README.md)** is the first reusable Grade 1 GDD template, available at `/shape-friends/` and through a small home-screen link. Match objects by shape with the supplied Sparky mascot, discover 18 picnic objects across four rounds, and play together in a persistent picnic. Its source, new generated garden/object illustrations, supplied art and save data are isolated from the original games. See its [art provenance](shape-friends/ASSETS.md) and template guide for reuse. This game currently uses device-speech fallback, not custom character recordings.

## Play

Serve the repository with `npm start`, then open http://127.0.0.1:4178. Node 20+ is recommended. No dependencies or build step are required. The root `index.html` and relative module/asset URLs work on GitHub Pages, including a repository subpath.

The child taps Play, completes a mandatory guided match, then travels through six gardens. Each new board introduces its pairs individually and lets the child study the full board before hiding it. There is no time pressure.

- Original vector storybook world, expressive Pip character and illustrated cards; no emoji placeholders or copied reference art.
- Visual hand-pointer tutorial with disabled off-target cards.
- Short **English on-screen captions**, with separate replayable **Hindi speech**. The player supports approved Hindi recordings through `VOICE_CLIPS` in `narration.js`; none are bundled yet. Until recordings are provided, it uses an installed Hindi **device/browser voice** at natural pitch. Voice availability and quality vary; this is **not a custom recorded or cloned character voice**. A device without Hindi speech still has complete visual guidance. See `VOICE_DIRECTION.md` for the production brief and integration requirements.
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
- `narration.js`: English/Hindi cue separation and approved-clip mapping.
- `voice.js`: recorded-clip playback with Hindi device-speech fallback.
- `tests/`: `npm test` verifies reward boundaries, full campaigns, replay accounting, shuffled decks, save validation and timer safety.

Baloo 2 is included under the SIL Open Font License in `assets/OFL.txt`. Pip's Garden visuals and chimes are original code-native assets. Shape Friends additionally uses user-supplied and newly generated illustrations, documented separately. Rupee coins are stylized learning illustrations, not banknote scans.

## Hosting

Push the root files to the experimental repository. If GitHub Pages is configured to deploy from `main` / root, GitHub publishes the game automatically after that deployment succeeds. This project itself does not alter repository hosting settings.
