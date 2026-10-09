# sparky_wall_nod_no

Complete export, pending animation approval. This package contains twelve registered 512 × 512 straight-alpha sRGB PNG frames, a 2048 × 1536 runtime atlas, a labelled review contact sheet, transparent APNG one-shot, wall-composited idle/action/idle previews, 100 px review previews, measured anchor metadata, and the source rig.

Frames 000 and 011 are byte-for-byte copies of the supplied approved wall idle, with no redraw. The body below y=211, gloves, wand, shoes and closed smile remain locked. The action lasts 1008 ms. Events: NO_BEAT=006; TRY_AGAIN_HOLD=009; NEUTRAL_HANDOFF=011. Play once, then return to idle. APNG preserves exact millisecond timings; GIF review timing rounds to 10 ms.

## Important animation limitation

These are connected local rig in-betweens derived from the approved artwork, not twelve newly hand-drawn poses. Head motion uses an in-plane rotation about a measured upper-neck proxy, with local compensation around the pinned smile and wand-side contour. It is not an anatomically drawn 3D horizontal head turn. A rigid neck rotation would move the mouth in canvas space, so fixed-mouth registration takes priority. Head-shake readability, emotional acting and integration in the actual game have not received production approval. Do not treat technical export checks as that approval.

The generated left pose study is included only as a guide, never as the runtime identity master. Original identity art is also included for provenance; the costume always comes from approved_idle_000.png.

## Coordinates and measurement

Coordinates are frame-local, top-left origin. seatAnchor=(256,300) and wall y=300 are authored registration supplied in the brief; an invisible wall cannot be measured from a PNG. Other anchors are measured semantic opaque-pixel centroids using the documented windows in sources/render_frames.py. headPivot is an upper-neck region centroid used as a 2D rig proxy. wandTip is the attached gold star centroid. Character bounds use exclusive right/bottom coordinates. The JSON records these conventions explicitly.

Runtime art contains no wall or background. Temporary walls appear only in review previews. transparent_one_shot.png is animated PNG. sources/render_frames.py rebuilds the exports with Pillow, NumPy and SciPy.
