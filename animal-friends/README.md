# Animal Friends

Grade 1 Dream Brainmatch variant for matching common animal pictures with
their English names.

- Level 1: Lion, Monkey, Fish and Frog — 8 cards.
- Level 2: Lion, Monkey, Fish, Elephant, Frog, Rabbit, Bird and Snake — 16 cards.

All content lives in `game-content.json`. The animal picture cards use the
polished 3D PNG artwork from Microsoft's
[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) project under the
MIT License. A copy of that license is stored beside the assets as
`assets/cards/FLUENT_EMOJI_LICENSE.txt`.

The word-card SVGs can be regenerated with
`node animal-friends/scripts/generate-card-art.mjs`. The script intentionally
does not overwrite the production animal artwork.
