# sparky_wall_nod_yes

12 transparent straight-alpha512-square PNG frames, one exact2048×1536 runtime atlas with512-square cells, labelled review contact sheet, transparent one-shot APNG, temporary-wall idle→nod→idle GIF/APNG and100px previews. Per-frame timings and measured pixel anchors are in `animation-manifest.json`.

Frame000 and011 are direct file copies of the recovered approved wall-idle000, not redraws. Their file bytes match the reference. All pixels below y211, the closed smile patch, wand and gloves remain unchanged. No wall or other scenery is baked into runtime PNGs or atlas. The action lasts976ms; event frames are004 YES_BEAT,008 YES_HOLD and011 NEUTRAL_HANDOFF. Do not loop the nod continuously. Pause freezes it; return to idle only at the exact neutral endpoints.

## Important constraint and art-method limitation

A true rigid rotation about the neck moves the mouth's canvas coordinates. The brief also rejects any mouth-pivot movement. These requirements cannot both be satisfied by a rigid head rotation. This package prioritises the fixed closed-mouth pixels and uses a shallow projected local head mesh with a measured upper-neck proxy, small eye/brow acknowledgement and delayed tip motion. It is not a certified physical4-degree neck rotation or12 independently hand-drawn character poses. The manifest labels the pitch values as animation rig parameters.

The generated peak-pose study was created with the built-in image-generation tool and used as an acting reference only. It was not substituted for the approved master because it changes source identity details. Runtime art stays from the approved master, with local rig in-betweens. Exact prompt, references and rebuilding script are included in `sources/`.

The technical exports are verified. Final approval of nod readability, the projected head acting and actual game integration remains pending. This package should not be described as final approved production animation merely because the file/anchor checks pass. A fully drawn natural neck rotation needs permission to let the mouth anchor move with the head, then those anchors must be measured per frame.

## Coordinates

All coordinates are top-left, frame-local pixels. SeatAnchor[256,300] is the user-supplied authored registration; an invisible anatomical seat point cannot be measured from a flat PNG. Mouth, neck proxy, wand grip, attached star, both gloves and shoes are measured opaque-pixel centroids in documented semantic windows. HeadPivot denotes the measured yellow upper-neck region centroid, not an inferred3D joint. WandTip is the gold star centre for effect placement. Bounds have exclusive right and bottom edges.

The smile is pixel-locked; no viseme layer or speech is required. Both hands and wand remain still, so anatomy and wand length are exactly the approved source. Minimum transparent padding is27px. Runtime atlas cells have no labels, borders or spacing.

## Previews and validation

`transparent_one_shot.png` is an animated PNG with straight-alpha transparency. GIF and wall APNG previews add1500ms neutral before the nod and2000ms after. GIF timing is rounded to its10ms format resolution; runtime durations remain the specified milliseconds. `preview_100px.gif` plays once; `review_100px_repeated.gif` repeats with those long idle intervals solely for review. The wall appears only in previews. Cream/navy edge review and enlarged head poses are also included.

Every runtime PNG was decoded, and every atlas cell compared with its numbered frame. The QA report records endpoint equality, anchor equality, locked-body pixels, dimensions and padding. The archive is tested for integrity and fully extracted with source hash comparisons before delivery.

Rebuild with `python3 sources/render_frames.py` using Pillow, NumPy and SciPy. Rebuilding preserves the original neutral file bytes.
