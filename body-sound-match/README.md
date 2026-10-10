# Body & Sound Match

Grade 1 Dream Brainmatch variant for body vocabulary, body functions and
beginning letter sounds.

The nine chapters are defined in `game-content.json`. Levels 1–6 use four
pairs; Levels 7–9 use eight pairs on a 4×4 board. Cards are previewed before
they flip closed, following the same child-friendly Sparky interaction model as
the other variants.

Picture cards use finished rendered PNG artwork from Microsoft's
[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) project under the
MIT License. A copy of the license is stored at
`assets/cards/FLUENT_EMOJI_LICENSE.txt`. Letters and word partners remain
crisp SVG typography because those symbols are the learning target.

Regenerate only the typography with:

```sh
node body-sound-match/scripts/generate-card-art.mjs
```

Regenerate the X-ray picture treatment with
`node body-sound-match/scripts/compose-special-art.mjs`.
