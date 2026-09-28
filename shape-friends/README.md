# Shape Friends — Sparky's play courtyard

## Current: clean Pip-inspired presentation and local voice cues

The active `clean.css` presentation uses `assets/calm-meadow-v2.webp` and Pip's star artwork from `../art.js`, with simple mint/cream cards. The painted meadow keeps the centre open, with restrained edge planting and a soft distant hill. Board, collection shelf and coach follow one layout flow; the basket, collected objects and hint have separate shelf slots. Earlier vector/orchard/courtyard presentations remain source studies; their heavy surfaces are overridden. Pip's own game files are not modified.

Eight main Sparky cues now use locally shipped generated MP3s (`voice/renders/`, AI Voice Generator's `delicate` preset). Reactions wait for the bounded remainder of a playing clip before switching turns. These are initial gentle voice candidates, not an impersonation or custom-trained child character voice. Remaining dynamic object names and discovery lines still use device speech. Voice can be muted independently. The assistant verified files and playback, not perceptual voice quality; audition before production release.

Four Grade 1 matching rounds, eight simple star cards, and Sparky in an explorer outfit. Three normalized four-frame atlases provide blink/wave, thinking/pointing and celebration drawings. These preserve the supplied flame-character design but redraw expressions for animation. Tap Sparky to wave. The discovery scene shows one activity and at most six toys at once. Watering progress is saved; roll/bounce and music play remain available.

This is not yet a playtested 30-minute adventure or a finished custom-voice production. More authored activities and child playtesting are needed to establish sustained engagement. There are no streaks, retention-pressure systems or forced session lengths.

A sunny, cooperative memory game with Sparky. Built from the supplied **Brain Match Game GDD**, Grade 1 Mathematics, Chapter 2, “What is Long? What is Round?” (pages 15–16). The supplied Sparky and object art establish the character style; the picnic world and five additional objects are newly generated illustrations.

Run `npm start` from the repository root and open **http://127.0.0.1:4178/shape-friends/**. No install, bundler, third-party runtime or build step. This route also works under a GitHub Pages repository subpath. Pip’s Garden and Barnyard Together remain separate, unchanged games; the original home screen has an additive link here.

## The experience

The matching scene is board-first: eight cards form one clear grid, with compact turn/progress above and a small collection tray below. Sparky coaches from below the board. A successful match briefly links the two cards before their objects travel into the collection tray. `clean.css` overrides the earlier tabletop surfaces with Pip's quiet world and simple card treatment.

Landscape is the primary presentation, using a fitted 16:9 stage. Portrait remains playable and offers a dismissible rotation suggestion; there is no orientation lock. Rotating does not reset the board. The suggestion dismissal lasts for the browser session when session storage is available.

Flip a card immediately. Find **different objects with the same overall shape**, rather than duplicate images. You and Sparky alternate one two-card turn each, including after a match. Sparky visibly thinks and points, uses only previously revealed observations, and contributes to the same picnic. No timer, penalties, XP, winner or loser.

| Round | Round | Box-like | Cone-like | Tall and round |
| --- | --- | --- | --- | --- |
| 1 | Football / beach ball | Matchbox / book | Birthday cap / paper cone | Glass / water bottle |
| 2 | Ball / orange | Matchbox / pencil box | Birthday cap / funnel | Glass / bottle |
| 3 | Watermelon / ball | Shoe box / book | Ice-cream cone / birthday cap | Tumbler / water bottle |
| 4 | Orange / football | Notebook / matchbox | Funnel / paper cone | Tumbler / bottle |

Matches contribute **both** objects to the shared discovery tray. A picnic opens after each round, with tap-to-play reactions and three drag/tap destinations. Round objects accumulate: 18 named discoveries, rendered with 16 unique object illustrations. Glass/tumbler and bottle/water bottle intentionally share supplied art. Those GDD names remain distinct content IDs.

The picnic is available from the small basket during your turn, including after a refresh. Replay reshuffles the board without duplicating discoveries. Completed rounds, discoveries and flower-watering progress persist; an unfinished matching board starts fresh after a reload. This does not affect the original Pip save system.

## Reuse this as a template

1. Duplicate the `shape-friends` folder for another topic. Keep URLs relative.
2. Edit `content.js`: pack metadata, four rounds of four pairs, object names, asset keys and interaction types. Keep two cards per pair and unique item IDs within each round.
3. Add transparent object WebPs to `assets/items/`. A 384 px image is sufficient for cards and toys. Current scenery is `assets/calm-meadow-v2.webp`, star art comes from `../art.js`, and animation uses `assets/animation/{wave,think,cheer}.webp`.
4. Give the new pack its own storage key in `save.js`. Never reuse another game's key.
5. Adjust `SHAPES` and matching language in `app.js`, then update page metadata and labels in `index.html`. The current template is specifically a **shape** matcher, not a generic automatically localized engine.
6. Add reviewed voice recordings to the manifest in `audio.js`, then run the rule tests and browser playtest with the new content.

The presentation uses a four-column board and is tuned for eight cards per round. More pairs require a deliberate layout change and phone QA, not just a data edit.

## Module boundaries

- `content.js`: curriculum and stable asset IDs.
- `engine.js`: hidden deck, legal reveals, pair resolution, strict turn alternation.
- `companion.js`: observed-position memory, fair card choices and hints. It receives no hidden deck.
- `save.js`: isolated, validated discovery/completion/settings storage.
- `timeline.js`: pause/resume/cancel-safe waits.
- `app.js`: round lifecycle, visible card rendering, input gates, transitions and captions.
- `sparky.js`: timed atlas-frame playback, game-state reactions, pause and reduced-motion handling. No artificial lip-sync. `pack-sparky.py` normalizes/assembles the generated strips with the sprite-pipeline scripts.
- `garden.js`: scene flowers and paper butterflies; receives discovery progress, never hidden card identities.
- `clean.css`: active Pip-inspired presentation; earlier styles supply shared layout and interaction rules through the import chain.
- `picnic.js`: discovered-object interactions, drag cancellation and keyboard equivalents.
- `audio.js`: separate speech/effect settings, approved-clip lookup, non-blocking device fallback.

State flow: your two flips → hold/reaction → Sparky's two flips → hold/reaction → your turn. Completion opens the picnic. A settings dialog or hidden tab pauses pending turn waits. Reshuffling/changing rounds cancels old callbacks before making a new deck.

## Sound and accessibility

Sparky uses eight local generated voice clips for main cues, plus browser/device speech for uncovered dynamic lines. No voice cloning was used. Available fallback voices differ between devices. There are no external TTS keys or synthesis requests in the running game. Audio can fail or be muted without blocking play. Captions are always visible, and the current board message can be replayed.

`VOICE_CLIPS` maps exact caption strings to local generated recordings awaiting perceptual approval. Clips play without pitch/rate alteration. A failed clip falls back at most once; a stopped/obsolete clip cannot start stale speech. The default effects are soft original synthesized notes, with a separate toggle. No background music is bundled.

Use an original bright, warm, playful Sparky voice for the final production pass. Do not copy a reference show's actor or character voice. Keep lines short, friendly and intelligible; use licensed or consented recordings.

All controls are native buttons or links. Tab/Enter/Space work; Escape opens or dismisses settings. Picnic drag-and-drop also works by selecting an object, then selecting a destination. Focus is visible; reduced-motion disables movement; phone layouts remain scrollable when height is limited. There is no account, analytics, advertising or child-data collection. Device speech may be implemented by the browser/OS.

## Verification

`npm test` runs the existing game tests and new shape-matching tests. `tests/shape-friends.test.js` covers all 224 ordered two-card choices across four rounds, 200 complete shuffled boards, fair memory/hints, input locking, turn alternation, assets, saves, timer cancellation/pause, mute and failed/stale voice clips.

For browser QA, launch the local server and an isolated Chrome with `--headless=new --remote-debugging-port=9223`, then run:

```sh
node tests/shape-friends-browser.mjs --full
```

The browser script operates native controls, observes only revealed card labels, plays all four rounds, exercises picnic interactions, checks restoration and reduced motion, and captures screenshots in `/tmp/brainmatch-shape-friends-*.png`. It uses Chrome's local debugging protocol and no external dependencies. Set `CHROME_DEBUG_URL` or `GAME_URL` to use other local ports.

See [ASSETS.md](ASSETS.md) for art provenance and reproducible import instructions. User reference folders and the full GDD are not needed to run the shipped game and are not included in the commit.
