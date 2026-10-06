# Sparky — `arrive_settle` key-pose review

**Status: key-pose guide only. Not a runtime sprite sheet.** The four-pose transparent image is an acting reference generated against the seated neutral master. It does not pass character-lock or fixed-pivot checks: eye proportions, flame contours, wand angle, and costume folds vary. Do not slice its columns into game frames or treat them as the requested 512 × 512 PNGs.

The exact approved neutral is `neutral_reference.png`. It must be used unchanged as the eventual final frame and as the first frame of `idle_blink`. The guide's last pose is *not* an acceptable substitute.

## Intended 16-frame action at 24 fps

| Frame | Acting / drawing target | Registration |
|---|---|---|
| 000 | Enter above/right of seat; curious gaze leads | Airborne |
| 001 | Descend; feet seek perch | Airborne |
| 002 | Kimono and flame tips follow descent | Airborne |
| 003 | Wand arm steadies as descent slows | Airborne |
| 004 | Eyes find landing point | Airborne |
| 005 | Hips approach seat; free hand prepares | Airborne |
| 006 | Feet and free glove anticipate contact | Airborne |
| 007 | **SEAT_CONTACT:** hips arrive at fixed seat anchor | Anchor locks here |
| 008 | Soft compression begins through limbs and fabric | Seat and feet fixed |
| 009 | Maximum compression, about 3% | Seat and feet fixed |
| 010 | Compression releases; sleeve and flame follow | Seat and feet fixed |
| 011 | Small rebound, no second landing | Seat and feet fixed |
| 012 | Eyes turn toward child | Seat and feet fixed |
| 013 | Smile warms; wand finishes follow-through | Seat and feet fixed |
| 014 | Settle toward exact neutral | Seat and feet fixed |
| 015 | **NEUTRAL_HANDOFF:** pixel-identical to `neutral_reference.png` | Fixed |

The guide columns depict approximate poses for 000, 007, 009, and 013. They are *not* registered or approved frames. Only frame 015 has a pixel-exact source in this package. Frames **000–014**, including all action-specific in-betweens, remain to be drawn and checked; there is no finished 24 fps preview or anchor manifest yet.

## Completion gates

Draw frames 000–014 against the exact neutral model, register the seat from 007 onward, and keep the wand grip coherent. Export 16 individual 512 × 512 straight-alpha sRGB PNGs with 24 px minimum padding. Measure each frame's seat, mouth, wand-hand, and wand-tip coordinates. Preview at 75–95 CSS px with the separate cloud perch. Compare 015 with `idle_blink_000` pixel-for-pixel; check edge halos on cream and navy.
