# sparky_wall_wand_pick — rigged animation draft v1

72 transparent 512×512 sRGB straight-alpha PNGs, 24 for each target direction. Three exact 3072×2048 atlases and separate labeled 6×4 review sheets. Transparent APNG previews, temporary-wall MP4 previews at24fps and a 100px comparison GIF are included. Walls and labels occur only in review previews.

Frame000 exactly matches the available Prompt05 CHOOSE_HOLD(014) for its direction. Frame023 exactly matches approved wall-idle000. Mouth, seat patch, hips and shoes stay fixed. Frames014–016 are pixel-identical stable holds.

## Runtime events

-010 CAST_RELEASE: spawn one independent travelling star at that frame's measured wandTip.
-014–016 STAR_WAIT_HOLD: pause on any of these identical poses until the star reaches the actual chosen card.
-Contact triggers card flip and sound; then resume017. The standalone preview simulates a short wait without a card or travelling star.
-023 SAFE_RESTART: neutral completion. Do not loop023 directly to000; obtain the next choose pose through observe/think.
-Pause freezes the current state, Home cancels it. Do not retrigger release when resuming.

## Measurements and limitations

All coordinates are top-left, frame-local pixels. seatAnchor(256,300) is inherited authored registration, not an anatomical measurement. Mouth and wand grip are measured exported pixel centroids. wandTip is the measured center of the attached golden star, used as the spawn point. The whole wand/grip/forearm is rotated at scale1; resampling changes centroid distance by less than0.85px.

This is a rigged draft, not72 independently drawn animation frames or a claim of final production approval. The available Prompt05 ending is itself a draft. A cast study created with the built-in image-generation tool informed the action but its face, costume and wand were discarded to retain original pixels. Sleeve/glove recovery is local raster deformation and endpoint substitution. Finger tightening, independently articulated elbow anticipation and expressive contact acting are approximations; these need animator review, particularly frames019–022. Gaze comes from the three existing choose masters, rather than a new fully drawn eye-tracking sequence. Actual game timing, UI placement and target-dependent star travel are untested.

Source references, generator prompt, rig/export code, timing/anchor manifest and automatic export checks are included. No effects are baked into runtime character frames.
