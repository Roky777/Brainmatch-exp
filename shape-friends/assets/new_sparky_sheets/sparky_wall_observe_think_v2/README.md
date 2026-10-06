# sparky_wall_observe_think_v2

Complete replacement export: **48 runtime PNGs**, 16 each in `left/`, `center/`, and `right/`. All are transparent straight-alpha 512-square sRGB files. Three unlabelled runtime atlases are exactly 2048-square, four columns by four rows, row-major, with no spacing. The labelled contact sheets are review-only.

Frames006 and007 contain new glove/sleeve drawings. They replace the rejected distorted arm interpolation from the incomplete package. Original identity, costume, neutral body, legs, shoes, wand and smile remain from the supplied source frames. The same arm poses are used across all directions; only the small head/gaze variation differs.

## Runtime events and handoff

- Frame000 is pixel-identical to the approved wall-idle000.
- Frame004 is OBSERVE_HOLD (default500ms), for observing a genuinely revealed card.
- Frame014 is CHOOSE_HOLD (default500ms), for a choice supplied by legal game memory.
- Frame015 is WAND_PICK_HANDOFF, pixel-identical to the corresponding supplied wand-pick000. Frame014 and015 are also pixel-identical, providing a stable held transition.

Select direction from the actual selected position. Art contains no cards, clues or hidden-information logic. Pause freezes the current pose; Home cancels. This is a one-shot, not a seamless neutral idle loop. A pair keeps the same actor's turn; the clip itself does not hand control over.

The supplied wand-pick starting poses keep the free hand near the chin. Preserving those exact endpoints takes precedence over a complete hand return to the ledge. A ledge-rest ending would require a coordinated change to the wand-pick starts, which are unchanged here.

## Previews

`transparent_preview_<direction>.png` is an animated PNG with true transparency and repeated review playback. `wall_preview_<direction>.gif/.png` uses a temporary wall for alignment. These repeated reviews append a reversed-pose reset bridge; that bridge is not part of the16-frame runtime sequence. The MP4s show the default timeline at24fps without that reset. `variants_100px.gif/.png` shows all directions at approximately100px character height; its restart is a review cut. Labels and wall occur only in review media.

## Coordinates and measurements

All coordinates use top-left frame-local pixels. `seatAnchor=[256,300]` and `wallPlaneY=300` are supplied authored registration, not estimated anatomy. Other manifest anchors are measured exported pixel centroids: dark smile, white wand grip, attached gold star, largest connected white free glove, and blue shoe regions. `wandTip` denotes the gold-star centre for spawning the separate effect, not the tip of one particular point. Bounds are alpha-support rectangles with exclusive right/bottom values.

Decoded-file checks confirm48 PNGs,48 exact atlas-cell matches, unchanged locked seat/leg/wand/smile regions, common body registration across directions, and exact starts/endpoints. Minimum clear padding is27px. Cream/navy edge reviews and an enlarged hand-rise review are included.

## Art method and remaining review

New local hand/sleeve art was produced with the built-in image-generation tool, then isolated and uniformly registered to the source. Only those local drawings are composited; generated replacement heads/bodies are discarded. All other action drawings retain the prior registered local rig. This is not48 newly hand-drawn full-character poses. Exact prompts, source drawings, references, registration measurements and export script are in `sources/`.

Technical export and completeness checks passed. Glove/sleeve acting and actual game integration still require animator review; automatic image checks cannot guarantee anatomical finger interpretation. The running game and recorded-audio integration were not tested. This package should not be treated as final animation approval solely because the files and handoffs are complete.

## Rebuild

Run `python3 sources/render_v2.py` with Pillow, NumPy and SciPy installed. Reference-pose source atlases contain the existing accepted poses and empty source cells at006/007; the two new arm layers fill those cells during export. The runtime atlases and numbered frames contain no missing cells. Sources do not include the rejected distorted006/007 drawings.
