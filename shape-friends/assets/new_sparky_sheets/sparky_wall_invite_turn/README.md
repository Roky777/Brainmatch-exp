# sparky_wall_invite_turn

16 numbered transparent sRGB PNGs, 512 × 512 px, straight alpha. The exact 2048 × 2048 runtime atlas uses 4 columns × 4 rows of 512 px cells, without labels, borders or spacing. `contact_sheet.png` is a separate numbered review sheet.

This is a one-shot invitation, not a continuous idle loop. Total default duration is 3041.667 ms. Read per-frame durations from `animation-manifest.json`.

## Timing and handoff

- 000: approved wall-idle neutral, 333.333 ms.
- 001–002: attention and 2 degree head inclination.
- 003: wand starts a small relaxed dip.
- 004–007: free elbow lifts, palm opens and extends gently.
- 008: `INVITE_HOLD`, 1000 ms by default; it may remain onscreen during an invitation line.
- 009: small warm brow accent.
- 010–012: arm returns and palm turns down toward the invisible ledge.
- 013: wand is back at its exact neutral pose.
- 014–015: settle and exact neutral idle handoff. Frame 015 holds 500 ms.

Frames 000 and 015 are pixel-identical to approved wall-idle Frame 000. The seat, shoes and mouth replacement patch remain pixel-identical throughout. The wall plane is y=300, with inherited authored seat registration (256,300). The wall appears only in previews.

## Anchors

Coordinates are top-left, frame-local pixels. The mouth anchor is the dark-smile pixel centroid; the wand hand is the white grip centroid; the wand tip is the gold star centroid. Wand measurement windows follow the rendered dip and match the approved idle windows exactly at neutral. Each coordinate is measured from its exported PNG. The seat coordinate is an authored registration point, explicitly distinguished from measured anatomical centroids. Source segmentation definitions are included in `sources/render_frames.py`.

The wand/hand/forearm patch uses a rotation-only transform, scale 1. Its actual drawn wand length is fixed; thresholded raster centroid distances vary slightly during resampling. No star-release or card-contact event exists in this clip.

The neutral mouth patch `[248,173,279,189]` uses right/bottom-exclusive bounds and never moves. A separate aligned viseme layer can supply speech. The actual game viseme atlas has not been tested with this export.

## Previews

- `transparent_preview.png`: one-shot transparent APNG with variable durations.
- `wall_composite_preview.png` / `.gif`: temporary wall composite; repeated for review only.
- `wall_composite_preview_24fps.mp4`: repeated review animation at 24 fps using the exact duration ticks.
- `preview_100px.png` / `.gif`: approximately 100 px visible-character height.
- `idle_invite_idle_preview.png` / `_24fps.mp4`: actual approved idle → invite → idle. Idle durations are rounded to 24 fps ticks in the MP4.
- `edge_check.png`: hold pose over cream and navy.

## Construction

The built-in image generator supplied one local invitation key drawing. Its face, torso and legs were discarded; the approved neutral supplies those unchanged elements. A local arm cage produces intermediate sleeve, elbow and glove positions from the neutral and invitation drawings. Head, brows and tiny fabric motion use local deformation. The wand uses the original artwork with a compact rigid dip. This is a rigged drawing animation, not 16 independently hand-drawn poses.

The wrist changes from resting to open-palm drawing between 004–005 and returns between 011–012. These are rigged pose changes, not separately redrawn turn-over drawings. They and the actual game/viseme integration still need production review. Export dimensions, atlas cells, padding, alpha, fixed anchors and neutral handoffs are checked in `qa-report.json`.

The original identity image, approved wall-neutral and idle frames, generated key pose, exact prompt and reproducible rendering source are included. No wall, cloud, cards, UI, background, travelling star or cast effect appears in the runtime PNGs.
