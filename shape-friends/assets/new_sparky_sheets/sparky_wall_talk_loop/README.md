# sparky_wall_talk_loop

16 numbered 512 × 512 straight-alpha sRGB PNGs. Character only: the wall is absent from every runtime frame. The 2048 × 2048 atlas packs those same images into exact 512 × 512 cells with no borders or spacing. `contact_sheet.png` is a labeled review image and must not be used as the runtime atlas.

## Playback

Use `animation-manifest.json` durations. The default cycle is 2.583333 seconds, with 500 ms neutral holds at both ends and a 416.667 ms conversational hold at Frame 007. Frame 007 may be held longer while a recorded line plays. Continue into recovery at Frame 008; hand off to idle at Frame 015. Frames 000 and 015 are pixel-identical to the approved wall-idle Frame 000. No mouth opening is baked in.

The mouth replacement region is `[248,173,279,189]`, right/bottom exclusive. It stays pixel-identical in every frame. Its dark-smile centroid is the measured `mouthAnchor`. Apply the separate viseme overlay there, then restore the neutral smile before handoff. The actual game viseme atlas was not supplied for integration testing.

## Previews

- `transparent_preview.png`: looping transparent APNG with frame timings.
- `repeated_loop_preview.png` / `.gif`: looping animation on a temporary wall.
- `repeated_loop_preview_24fps.mp4`: three cycles at 24 fps; each numbered pose is held for the manifest's specified number of ticks.
- `idle_talk_idle_preview.png`: actual approved idle frames, then talk, then actual idle frames; variable timing APNG.
- `idle_talk_idle_preview_24fps.mp4`: same handoff sequence sampled at 24 fps; idle timings are rounded to video ticks.
- `preview_100px.png` / `.gif`: approximately 100 px visible-character height on a temporary wall.
- `edge_check.png`: peak gesture on cream and navy.

Walls and cream backgrounds exist only in preview files.

## Construction and checks

This is a rigged drawing animation, not 16 independently redrawn poses. The approved neutral drawing supplies the body and face; a generated, locally isolated palm-up arm drawing supplies the conversational pose. A local arm cage provides the in-between sleeve, elbow and hand positions, using one glove drawing per pose to avoid doubled outlines. Local head inclination reaches 2 degrees; chest, brows and flame follow-through remain compact. No whole-image sliding or scaling is used.

Pixel comparison verifies fixed mouth patch, hips/seat region, thighs/legs/shoes, wand grip and star tip, plus exact neutral start/end. Exported anchors are measured from the PNG pixels using the segmentation methods in `sources/render_frames.py`; the inherited seat registration `(256,300)` is an authored registration coordinate, explicitly distinguished from measured glove/mouth/shoe centroids. All frames pass 24 px padding and contain zero RGB in fully transparent pixels. See `qa-report.json`.

The arm changes from resting-hand drawing to palm-up drawing between Frames 003–004 and returns between Frames 010–011. Those wrist-turn transitions are rigged pose changes, not separately drawn turn-over poses. The package is export-ready, but that acting transition and the actual game/viseme integration still require production review; it is not certified against an unavailable game build.

## Sources

The original identity reference, exact approved neutral and approved idle sequence are included. Generated images were made with the built-in image generation tool; only their local arm art is used. `sources/generation-prompt.txt` records the prompt set. `sources/render_frames.py` reproduces the PNGs, atlas, metadata and APNG/GIF previews with Pillow, NumPy and SciPy. MP4s use FFmpeg.
