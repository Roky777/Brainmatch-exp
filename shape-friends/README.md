# Shape Friends — play with Sparky

Run `npm start` from the repository root and open http://127.0.0.1:4178/shape-friends/. No build or runtime dependencies. Original Pip and Barnyard games remain intact.

## Current experience

The home screen places animated Sparky on the left and **Practice** / **Beat Sparky** on the right. Choosing either opens a separate level-selection panel; Back returns to the two-mode menu.

| Level | Cards | Sparky remembers |
| --- | ---: | --- |
| Little spark | 4 | Last 2 observed positions |
| Bright spark | 6 | Last 4 observed positions |
| Super spark | 8 | All revealed positions |

Practice gives every turn to the child. Tap Sparky for a hint based only on previously revealed cards. In Beat Sparky, each pair earns one point and another turn; a miss passes play to the other player. This rule applies equally to the child and Sparky. The result can be a child win, Sparky win or tie. No timer, penalty, purchases or retention pressure.

The matching screen contains cards, one compact turn/progress-or-score indicator, Sparky with a short caption, home and pause. No collection shelf, hint button, rotation prompt, picnic activities or level selectors compete with the board. Result actions offer another board or return to setup. Home cancels the current turn and returns to setup.

Content remains the Grade 1 GDD **What is Long? What is Round?** pack: four authored sets of different objects sharing an overall shape. Difficulty levels are NOT grade labels; a full class 1–3 curriculum has not been authored. Smaller boards use the first two or three pairs of the selected set. Completing a board unlocks the next set; replay moves to it. Progress uses the existing isolated save key. Settings can select unlocked sets.

## Art and character

The active `dream.css` theme follows the latest dream-sky reference: luminous blue sky, pink-lilac clouds, sunlit leaves, smooth shaded objects and blue-lilac star cards. The quiet central play area and Sparky's existing face/sprite atlases are preserved. See [ASSETS.md](ASSETS.md) for generated sources, prompts and provenance. Original and earlier painted objects remain available; `prepare-painted-art.mjs` with the `dream` argument reproduces current atlas extraction with cwebp.

Sparky uses drawn greeting, blinking, thinking/pointing and celebration frames. Event-driven dialogue rotates match/miss variants, responds to wins/ties and leaves quiet time for play. Twenty-one local English MP3 clips are shipped, including 13 new mode/reaction clips. Main active captions have local recordings; device speech is a failure fallback. Voice and effects have separate toggles, captions and replay.

**Voice limitation:** generated with AI Voice Generator's gentle `delicate` preset. Context and animation are implemented, but emotional acting has not been perceptually approved. No custom character-trained voice, microphone conversation or phoneme lip-sync. The assistant checked playback/decoding, not acting quality. Voice direction and clean scripts live in `voice/`.

## Architecture

- `engine.js`: hidden cards, input lock, practice/challenge turns, pair scores.
- `companion.js`: bounded observed-position memory; never receives hidden deck identities.
- `play-options.js`: level definitions, option validation and result classification.
- `dialogue.js`: context-specific rotating line banks.
- `app.js`: setup, round lifecycle, interaction, results, pause/cancellation.
- `audio.js`, `sparky.js`: local clip playback and sprite-frame reactions.
- `content.js`: stable item IDs, shape pairs and versioned dream-art URLs.
- `save.js`, `timeline.js`: isolated persistent progress and cancellable waits.

Earlier picnic modules/assets remain as source history but are not exposed in the current mode-first flow. Old discovery data is preserved. There is no analytics, account or child-data collection.

## Verification and reuse

`npm test` covers the original games, shape rules, scoring, mode transitions, fair memory, saves, audio failures, sprite frames and dialogue coverage.

With the local server and isolated Chrome debugging on port 9223:
```sh
node tests/shape-modes-browser.mjs
```
The old `shape-friends-browser.mjs` entry point delegates to this current suite. It plays all six mode/level combinations, checks responsive bounds, local audio decoding/playback, score totals, pause, cancellation and reduced motion. See [QA.md](QA.md).

To reuse the template, author a new content pack, assign a distinct storage key and update labels/assets. Test curriculum accuracy and silhouettes with children and educators. This is not yet validated 30-minute engagement or device-lab Safari certification.
