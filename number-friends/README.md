# Number Friends

Grade 1 counting and number-representation variant of Dream Brainmatch.

## Learning relationship

Every pair represents the same quantity in two different ways: numeral, dots,
fingers, or a clearly separated group of familiar objects.

## Game flow

Number Friends deliberately uses the same child-facing flow as Shape Friends:

1. Choose Practice or Beat Sparky.
2. Choose Easy (2 pairs), Medium (3 pairs), or Hard (4 pairs).
3. See every card briefly, then find the matching quantities.
4. Move through the seven counting chapters as boards are completed.

All chapter content lives in `game-content.json`. Numerals and dots remain
deterministic SVG learning cards. Fingers and countable object groups use
finished rendered PNG artwork. The object sources come from Microsoft's
[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) project under the
MIT License.

A copy of the license is stored at `assets/cards/FLUENT_EMOJI_LICENSE.txt`.

- Regenerate numeral and dot cards: `node scripts/generate-card-art.mjs`
- Regenerate rendered quantity groups: `node scripts/compose-quantity-art.mjs`

## Chapters

- Numerals and dots, 1–4
- Numerals and fingers, 2–5
- Fingers and dots, 1–4
- Numerals and familiar object groups, 3–6
- Mixed representations, 1–8
- Mixed mastery matches
- Visual-to-visual matches with no numeral clue
