# sparky_wall_arrive_settle — rigged draft

20 numbered transparent 512 × 512 straight-alpha sRGB PNGs at 24 fps. The action lasts 833.333 ms. The runtime atlas is exactly 2560 × 2048, with 5 × 4 cells of 512 px; labels appear only in the separate review contact sheet.

`SEAT_CONTACT` is Frame 007. The inherited seat registration is fixed at (256,300) from that frame onward. Frame 019 is `NEUTRAL_HANDOFF` and is pixel-identical to approved wall-idle Frame 000. Frame 008 uses a local 2% torso compression; it recovers toward neutral without a second bounce. Frame 012 has one small forward shoe movement. All frames keep at least 24 px transparent padding.

## Construction and limits

This is a rigged animation draft, not 20 independently hand-drawn poses. The approved neutral supplies the head, torso, gloves, wand and shoes. A newly generated bent-knee drawing supplies local trouser folds, registered to a body/joint cage. Shoulders, hips, knees, balance hand and feet have separate trajectories. Each original shoe moves as a rigid piece, preserving its silhouette and trim. The head has compact follow-through; the original eye art receives a tiny local downward-gaze deformation, then returns to neutral. Dedicated facial acting and gaze in-betweens have not been drawn.

At the locked neutral scale, the flame starts only 28 px from the top canvas edge. A large upward move would violate the padding requirement. The exported descent is therefore compact: the hips approach from y278 to y300 while the legs tuck and extend, and the head moves only a few pixels. This does not depict a long offscreen entrance. A larger entrance needs game-level positioning or a revised shared master layout. Neither is silently baked into this package.

Review trouser transition drawings, eye acting and wall clearance in the actual game before production approval. The supplied temporary wall preview is not a verification of the game's real wall artwork, UI collision bounds or masking. The character PNGs contain no wall or background.

## Delivery

- `sparky_wall_arrive_settle_000.png` through `_019.png`: runtime frames.
- `sparky_wall_arrive_settle_atlas.png`: exact runtime atlas.
- `contact_sheet.png`: numbered 5 × 4 review sheet.
- `transparent_preview.png`: one-shot transparent APNG at 24 fps.
- `wall_composite_preview.png` / `.gif` / `_24fps.mp4`: temporary wall alignment review, with a final hold.
- `preview_100px.png` / `.gif`: approximately 100 px character-height preview.
- `arrive_idle_preview.png`: arrival immediately followed by the actual approved idle animation.
- `edge_check.png`: contact/compression frame over cream and navy.
- `animation-manifest.json`: durations, event frames, frame-local anchors, bounding boxes, construction and limitations.
- `qa-report.json`: export checks.

## Coordinates and measurements

Origin is top-left of each cell. `seatAnchor` is an authored registration trajectory, not a guessed pixel measurement of a hip joint. Other anchors are measured from the exported PNG pixels: dark smile centroid, white wand grip/balance glove centroid, gold star centroid and blue shoe pixel centroids. Measurement windows follow the local action and return to the same approved-neutral windows at handoff. Source code documents the feature segmentation.

Source references, generated trouser key drawing, exact generation prompt and the local rendering script are included. Generation used the built-in image tool; export/rig rendering uses Pillow, NumPy and SciPy. MP4 previews use FFmpeg. No turquoise costume, cloud, cards, UI, star trail, beam or confetti appears in runtime art.
