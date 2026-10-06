# sparky_wall_mouth_visemes

17 named transparent 256 × 256 PNG mouth overlays, an unlabelled runtime atlas, labelled review atlas, overlays on supplied idle frames 000/005/014, speaking demonstration, measured manifest and export QA. Source art and reproducible processing are included.

## Integration

The approved body already contains a black closed smile. For speech, draw the approved body, then `integration/base_mouth_cleanup.png` at its original 512 × 512 registration, then the selected mouth. The cleanup patch is deliberately separate: the mouth PNGs contain no yellow face matte.

Scale a 256-square mouth to 64 × 64 on the 512-square body (0.25 scale). Position its `[128,128]` pivot at `measuredReferenceMouthAnchor512` in the manifest. Use this measured mouth position rather than the seat anchor or the older dark-pixel centroid. Apply the body's transform to all layers together. Atlas cells are 256-square, five columns, four rows, row-major; the last three cells are empty. Labels appear only in review images.

At speech end, show REST briefly, then hide both mouth and cleanup layers to return to the untouched original body. REST was extracted and unmatted from the master and resampled; its reconstructed overlay is not guaranteed pixel-identical. The original body's baked smile is the exact neutral endpoint.

The supplied repair is suitable for the three tested idle frames because their mouth region is identical. Head-turn or other face drawings need their own aligned clean-mouth base. Do not stretch this repair over a differently drawn head.

## Speech and transitions

Map phonemes from recorded audio to the named shapes; there is no baked random lip-flapping body animation. The manifest recommends REST → A, A → O and O → REST transitions. Use audio-driven holds rather than constant-rate cycling. FV and LTH are deliberately simplified cartoon tooth/tongue shapes; inspect their mapping against your actual voice recordings.

The speaking GIF/APNG/MP4 are silent shape demonstrations ending in REST, not audio-synchronised dialogue. MP4 is a cream-background review, not transparent runtime art. All runtime mouth PNGs use straight RGBA and an embedded sRGB profile. The standalone small GIF shows approximately 105 px character height.

## Validation and limits

Every PNG is decoded and compared with its exact atlas cell. Alpha-weighted centroids are measured within 0.12 px of `[128,128]`; bounds and measurements are in `animation-manifest.json`. All shapes are distinct, have transparent padding, and have zero RGB beneath zero alpha. Test overlays leave pixels outside the small mouth region unchanged, including eyes, eyebrows and costume. Cream and navy reviews are included.

This is an integration-ready export set. Final approval of phonetic acting, face repair under every other body action, and recorded-audio lip sync remains an animator/game integration check. It has not been tested in the running game.

Art method: generated mouth glyph plate, isolated and regularised to the approved outline weight; original REST extracted from the master. Six transition drawings use single-contour distance-field interpolation, not duplicated cells. `sources/build_visemes.py` and `sources/check_exports.py` reproduce the exports and checks.
