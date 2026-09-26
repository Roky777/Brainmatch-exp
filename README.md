# Little Lantern Barn

An original, cooperative memory game for young children. The child and Tilly, a friendly farm dog, alternate turns while filling one persistent, interactive barnyard.

## Run

Node 20+ is recommended. There are no external dependencies or build step.

```bash
npm start
```

Open <http://127.0.0.1:4178>. Run the logic tests with `npm test`.

The site also works as static files on GitHub Pages, including from a repository subpath.

## Play

- Round 1: Cow, Hen, Hay, Egg
- Round 2: Duck, Sheep, Pond, Flowers
- The child always goes first; turns alternate after every attempt.
- Tilly remembers only cards that have actually been revealed. She takes a known pair when one exists and explores an unseen card otherwise.
- “Help me remember” uses that same visible-information memory and never reveals a card.
- Every match adds its discovery to the shared barnyard, regardless of who found it.
- Discoveries and completed rounds are stored locally and restored after refresh. Replays reshuffle without duplicating objects.

In Explore mode, tap the cow, hen, duck, sheep, or flowers. Drag hay to the cow, the egg to the nest, or the duck to the pond. Mouse, touch, and keyboard are supported.

## Architecture

- `game-data.js` — data-driven round and discovery content
- `memory-game.js` — board state, turn alternation, matching, and input locks
- `guide-ai.js` — fair shared-memory guide decisions and hints
- `storage.js` — save validation and local persistence
- `barnyard.js` — mouse/touch discovery interactions
- `audio.js` — resilient speech fallback and synthesized effects
- `art.js` — original code-native vector illustrations
- `script.js` — UI orchestration, animation flow, and screen state

All guide lines have visible captions. This prototype intentionally identifies and uses the browser/OS speech synthesizer as its voice fallback; playback failure never blocks the game. Voice and music/effects have separate controls. Original sound effects are synthesized locally. No accounts, tracking, ads, purchases, copied characters, stock icons, or network-loaded assets are used.

## Accessibility and resilience

Cards are native buttons with changing accessible labels. Focus is visible, sound is optional, captions remain available when muted, and non-essential motion respects `prefers-reduced-motion`. Turn and resolution locks prevent rapid taps from corrupting play.
