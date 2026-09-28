# Art provenance

## Active presentation — 28 September, kimono Sparky and separate game scenes

`studio.css` is the active layout. It retains the generated `dream-meadow-v1.webp` sky/background, dream star cards and dream object art below; it does not use the newer supplied vertical meadow background. The user supplied five 1448 × 1086 kimono Sparky PNG sheets in `assets/sparky/ChatGPT Image Sep 28, 2026, ...-1.png` through `...-5.png`. `prepare-kimono-sparky.py` makes transparent WebP sheets for expressions, reaching, reactions, peeking, and sleeve/glove studies. The source sheets are retained unmodified. The separate sleeve/glove studies are not played after the stretched-arm version was rejected. The active character uses these user-supplied/generated images; we do not claim hand-drawn animation or frame-by-frame polish.

On Sparky's turn, his pointing pose and a code-drawn sparkle travel toward the chosen card; the card remains a live accessible button with the same reveal logic. The composition borrows the sorting template's restrained character-body motion rather than stretching a bitmap sleeve across the scene. Reduced-motion behavior and small-screen placement are verified by browser tests. Previous art directions below are development history, not the current presentation.

## Active dream direction — September 28

Follow-up foreground cleanup: the built-in image edit hit its usage limit and produced no replacement. The current scene uses a top-aligned 123% CSS crop to reduce foreground grass; this is not a painted removal. Sparky retains his existing face and animation atlases, with a restrained colour filter and soft grounding shadow. Further character relighting and foreground repaint remain art-polish work.

The latest user reference supersedes the ink/watercolour direction below. `dream.css` preserves the minimal mode-first layout and Sparky's existing face/atlases while changing background, card, control and object materials. These assets were made with the built-in image tool, not CLI image generation.

- `assets/dream-meadow-v1.webp`, source `exec-f0a16d3a-8362-4e4c-99d9-e774b500f3e9.png`: prompt — original dreamy luminous anime-inspired meadow; blue sky, pink-lilac clouds, sunlit translucent leaves, soft natural bloom; slim tree at far left, detail at edges, quiet central 70%; no UI, characters, props, dense foliage, paper grain or ink outlines. The user's attached dream-tree image is a style reference only.
- `assets/dream-star-card.webp`, source `exec-3ec0c5ea-5e29-486a-bc94-ada50d1da91f.png`: prompt — square smooth periwinkle/powder-blue/lilac card, one softly lit smiling golden star, fine cream inset border, no grain, glitter, props, text or thick bevels.
- `assets/items-dream/*.webp`, edited atlas source `exec-1ef8e2cb-3444-400c-ace8-137c3c25628d.png`: prompt — preserve the earlier sixteen-object atlas identities, silhouettes, positions, grid, colours and scale; replace grain/brown ink with smooth luminous anime object painting, warm upper-left highlights, blue-lilac shadow bounce, delicate coloured contours, transparent surroundings, no added props/text.

Reproduce objects/card with `node shape-friends/prepare-painted-art.mjs GENERATED_SESSION dream`. Background uses `cwebp -q 88`. Older art is retained as studies and is not the active visual theme. No claim of human-made artwork or exact reproduction of the user's reference.

## Earlier painted play objects and materials — September 28

The approved `calm-meadow-v2.webp` background and Sparky sprite sheets remain unchanged. `painted.css` uses newly generated material and object art to match the background. All three were made with the built-in image tool, not CLI generation; these are AI-generated illustrations, not commissioned human artwork.

- `assets/items-painted/*.webp`: sixteen separate objects extracted from one transparent 4×4 atlas, source `exec-6a770a1f-48d5-41cb-826d-5b02429a8f52.png`. Prompt: delicate warm-grey ink, translucent watercolour/gouache shading, cream pigment, soft upper-left light, clear curriculum silhouettes, no faces/labels/scenery/glossy 3D; ordered football, beach ball, blue ball, orange, watermelon, matchbox, book, pencil case, shoe box, notebook, birthday hat, paper cone, funnel, ice cream, glass, water bottle. The 18 content IDs still share glass/tumbler and bottle/water-bottle pictures.
- `assets/painted-star-card.webp`: source `exec-89370fb9-0798-442d-a735-5bbbf8b900b2.png`. Prompt: dusty-teal watercolour paper, small softly painted smiling honey star, fine organic warm-grey ink, one thin cream inset border, no stitching, bevel, text, glitter or plastic finish.
- `assets/ivory-paper.webp`: source `exec-47bd6629-a3e0-412c-b08e-9b64f9c77e9e.png`. Prompt: extremely subtle warm-ivory watercolour paper material with a clean centre, no objects/text/stains/folds. Only the quiet opaque centre is used.

`prepare-painted-art.mjs` records inspected atlas gutters and reproducible cwebp conversion. Original object files remain intact. Controls remain live accessible SVG/button elements, with fine ink, muted colours and shared paper surfaces; the game is not a flattened generated screenshot.

## Current: calm painted meadow and organised play area

`assets/calm-meadow-v2.webp` is the active background, generated with the built-in image tool from source `exec-9d9832ec-9907-4635-a7dd-d45feb69fb04.png`. Converted with `cwebp -q 88`. It is one generated illustration, not human-made art or an assembly of cutouts. The supplied Goldman image was a style reference, not a shipped asset.

Final prompt brief: background only, landscape 16:9; retain delicate ink and softly painted storybook finish while reducing environmental detail by at least 80%; broad pale sage meadow, pale blue sky, one distant hill, sparse cropped tree at far left and low planting bottom right; central 80% quiet; no interface, mascot, cards, apples, flowers, fences, rocks, buildings, strong shadows or dense foreground. Soft diffuse daylight and low-contrast cream/sage/blue palette.

`assets/quiet-garden.svg` is the earlier code-authored vector composition study. `assets/painted-orchard-v1.webp` (generated source `exec-c9e1eeee-e0b0-4951-83ea-11d1c26571a5.png`) is the richer orchard study rejected as too busy. Neither is loaded by the active presentation. Existing cards, object art, Sparky sprites and voice clips are unchanged. Layout uses one flow for board, shelf and coach, with explicit nonoverlap checks.

## Earlier board-first composition follow-up

No new raster artwork was generated for the tabletop pass: the built-in image tool returned a usage-limit error. The implemented inset board uses native layout/material styling and reuses `assets/star-tile.webp` as nine-slice painted wood edging. The existing courtyard, tile art and sprite atlases are unchanged. The board, rim indicators and discovery drawer share one layout parent. Match connections are runtime SVG feedback, not baked illustrations.

## Current playful courtyard and real sprite strips

The previous jungle/ruins scene and static composite mascot were rejected. Current production assets were generated with the built-in image-generation tool and normalized with the sprite-pipeline skill scripts.

| Runtime asset | Generated source |
| --- | --- |
| `assets/play-courtyard.webp` | `exec-e96b21b6-97f3-46d2-990b-d7006e76b792.png` |
| `assets/star-tile.webp` | `exec-42a51d6a-455c-43b3-8985-1341ed971d9f.png` |
| `assets/animation/wave.webp` | `exec-620e5bff-b528-41cc-a69e-7b88042d1279.png` |
| `assets/animation/think.webp` | `exec-25a98aa8-571e-4eca-842a-18cc51589e50.png` |
| `assets/animation/cheer.webp` | `exec-10303f30-2a96-495d-a341-f2888bc839ea.png` |

Final background prompt: landscape 16:9, fine expressive ink contours and softly translucent painted colors based on the user's supplied Goldman art reference; open sunny seaside toy-makers' courtyard, warm cottages at the edges, turquoise sea, light bunting and a few potted flowers. Broad quiet cream terrace for live gameplay. No dense canopy, vines, ruins, jungle, stone slabs or baked-in interface. Final tile prompt: single rounded wooden tile, dusty turquoise enamel face, warm cream border, honey wood edge, small friendly golden star; hand-inked paint variation, transparent surroundings, no stone or moss.

Sprite prompts shared these invariants: same flame silhouette, yellow/orange/red palette, huge black eyes with white highlights, no nose, same explorer outfit and proportions, facing front, true transparency, exactly four equal slots in one horizontal strip, no scenery or labels. Each entire strip was generated in one request from the same in-game reference canvas, not independently generated frames. Actions: wave = neutral → blink → raised glove → waving glove; think = neutral → glove at chin → realization → point toward board; cheer = crouch anticipation → hands raised/laugh → arms wide → settle.

`assets/animation/seed.png` preserves the former in-game identity/costume reference. Generated expression frames retain that character design but are not pixel-identical copies of the original face. `pack-sparky.py` runs the installed shared-scale/bottom-center normalization and preview-sheet scripts; its output is three 1536×384 transparent WebP atlases and bounds metadata in `atlas.json`. Reproduce with `python3 shape-friends/pack-sparky.py GENERATED_SESSION shape-friends/assets/animation/seed.png GAME_STUDIO_PACKAGE_ROOT`.

Animation playback is actual atlas frame selection, not CSS rotation of a static cutout. Settings/visibility pause playback. Reduced motion uses one semantic still per state. The miniature discovery-scene mascot uses the neutral atlas frame. Earlier artwork below is retained only as source history/studies.

## Earlier adventure scene (superseded)

Built-in image generation was used, not the API/CLI fallback. The user approved concept `exec-10f61a00-a693-4d53-aa3c-12af32f0ac49.png`, then requested 99% the same art with a slight cute touch. The supplied Goldman screenshot was an art-direction reference, not a shipped game asset. All three outputs below are shipped locally in `assets/` as optimized WebP files.

| Runtime file | Generated source |
| --- | --- |
| `assets/adventure-garden.webp` | `exec-679b4b94-0c17-4934-bb0a-8da3bc89f8c8.png` |
| `assets/stone-leaf.webp` | `exec-cfbced4d-7594-4d9f-b853-fae79f342962.png` |
| `assets/explorer-costume.webp` | `exec-f373ccfa-7875-4e11-942e-997cf59539d3.png` |

Final prompt briefs: keep the approved richly inked and painted turquoise-waterfall garden almost unchanged; add a round little bird and cream flowers; remove all tiles, character and UI to leave an empty limestone terrace. Create one front-facing, rounded limestone memory tile with a green engraved leaf and subtle moss, transparent outside the tile. Isolate the explorer mascot in a moss-green vest, cream shirt, brown belt and boots on transparent background. The generated mascot's head is **not used**: `sparky.js` clips the costume below the neck and overlays the supplied `assets/sparky/idle.webp` face. Only head/body motion is used; the original face pixels and flame silhouette remain intact.

Source session: `/Users/rax/.codex/generated_images/01a0de79-dcf3-74f2-83c7-d60969a94185/`. Runtime does not depend on that location. `prepare-assets.mjs` records the import mapping. These are raster assets, while cards, buttons, objects, captions and progress are live interactive elements, not baked into a screenshot.

## Earlier picture-book study (superseded)

The implemented scene uses the built-in image-generation tool's Japanese picture-book direction: delicate gouache/watercolor washes, warm ivory paper grain, peach blossoms, sage foliage and quiet open areas for play. Prompts requested no baked-in characters, controls, words, cards or undiscovered objects in the scene backgrounds.

| Current asset | Generated source |
| --- | --- |
| `book-garden-portrait.webp` | `exec-af2867e5-ccf0-4676-bff9-c9b817fbf788.png` |
| `book-garden-wide.webp` | `exec-65146cd4-e219-4360-bab3-8a4b0260539f.png` |
| `storybook-open.webp` | `exec-02a9fd5a-7290-4954-9644-f3dafe92d9eb.png` |
| `paper-card-back.webp` | `exec-18fd8e0b-f035-49d1-94f9-e9ba1f2bf7ea.png` |

Book brief: an overhead open blank ivory storybook, gently worn paper edges, brown cloth cover, tiny painted leaves and blossoms only at the extreme corners. The generated book retained a brown backdrop despite a transparency request; the runtime clips its perimeter to the physical book outline. Card brief: one tactile apricot watercolor paper card, cream border, a single sage sprout and tiny cream flower, no faces or writing. Backgrounds use a cottage and blossom branches only at the edges, leaving the mossy clearing quiet.

The full composition concept `exec-fc357545-7df9-438d-b148-cffae877745f.png` was used as a **style reference**, not a runtime screenshot. No text or objects from that concept are used as noninteractive substitutes for game controls.

The superseded picture-book study used an SVG garden-apron mascot. It was replaced after user feedback; current Sparky instead uses the original face and a painted explorer costume. Earlier generated poses and landscape assets below remain development studies, not the current character or scene.

## Supplied project art

The user provided `sorting template` as their existing game/art reference and asked that it be used for this game. Only the necessary images were copied into this standalone template. The reference game's code, nested Git history, Android project and unused assets were not imported.

11 picture illustrations were taken from `assets/GRADE 1/maths game/` in that folder:

- `level 3/football.png`, `level 3/orange.png`, `level 3/matchbox.png`, `level 3/book.png`, `level 3/stationary box.png`.
- `LEVEL 1+2/ball (1).png`.
- `level 4/birthday_cap.png`, `level 4/paper_cone.png`, `level 4/funnel.png`, `level 4/drinking_glass.png`, `level 4/water_bottle (1).png`.

Seven Sparky pose sheets came from `assets/characters/runtime/sparky-{idle,thinking,happy,thumbs-up,surprised,present-right,blink}.png`. They retain their original 724 × 543 grid and alpha. These sheets have loose pose registration, so the runtime selects inspected frames instead of playing the entire grid as a jittery animation. Container motion provides breathing and a small cheer.

All source ownership remains with its respective owner. These supplied assets are not represented as public-domain or independently licensed artwork. The user should retain their original rights records before wider redistribution.

## New generated illustrations

Six images were created for this task with the built-in image-generation tool. No artwork, branding, characters or dialogue from Daniel Tiger or PBS is used.

| Shipped asset | Generated source filename |
| --- | --- |
| `picnic-garden.webp` | `exec-7c9da965-bdf0-4480-bd90-97cbcefb2dda.png` |
| `items/beachball.webp` | `exec-e8053899-b529-4a4f-8dfe-a0ca636453eb.png` |
| `items/watermelon.webp` | `exec-bba1f6b3-dd26-4737-a920-811ce5ae8a4f.png` |
| `items/shoebox.webp` | `exec-72eed347-59bf-44fb-a104-baea51e1f7f5.png` |
| `items/icecream.webp` | `exec-970b2cea-5fe4-4220-bd74-d99ad7ee62b9.png` |
| `items/notebook.webp` | `exec-543981f2-8638-4939-9ff5-d72a8f3431ab.png` |

Original generated PNGs remain in the local image-generation session `01a0de79-dcf3-74f2-83c7-d60969a94185`. The game ships optimized WebPs, not references to that local cache.

### Generation brief

Background: premium original 2D children's memory-game picnic garden, sunny golden light, soft painted shading, clean friendly silhouettes, mint/teal foliage, apricot flowers and blue sky. Pavilion at far left, framing trees at far right, distant lake/bridge/hills; horizon around 45%; central 65% kept quiet for eight cards. A picnic blanket at bottom left. No UI, text, cards, characters or animals.

Object treatment: one isolated, easily recognized Grade 1 picture-card object, bold clean dark navy contour, saturated colors, smoothly shaded glossy highlights, generous transparent padding, no text, labels, faces, backdrop or cast shadow. Large readable silhouette, coordinated with the supplied Sparky and object art.

Subjects:

- Beach ball: coral, teal and warm yellow panels, round inflated silhouette.
- Watermelon: one nearly spherical green striped watermelon, not a slice.
- Shoe box: closed coral rectangular box with a cream lid, clearly box-like.
- Ice-cream cone: one creamy scoop with a long visible pointed waffle cone.
- Notebook: closed yellow rectangular notebook with a teal spine, no printed words.

These are the recorded art briefs; the import script identifies the exact resulting artifacts.

## Optimization and reproducibility

`prepare-assets.mjs` imports from the two source folders using `cwebp`. Cards are resized to 384 px with preserved alpha, Sparky sheets keep their pixel dimensions, and the scene is 1536 × 1024. Total shipped visual assets are approximately 1.4 MB. No remote asset URLs or missing generation-cache dependencies are used at runtime.

```sh
node shape-friends/prepare-assets.mjs '/path/to/sorting template' '/path/to/generated_images/01a0de79-dcf3-74f2-83c7-d60969a94185'
```

The local Garden font is reused from `../assets/garden.woff2`, under the existing SIL Open Font License in `../assets/OFL.txt`. Card backs, UI marks, pointer, transitions and chimes are original code-created elements.
