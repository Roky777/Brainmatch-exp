# Sparky animation sheet brief

The current kimono sheets are 4 × 3 atlases with only 12 independently drawn poses. They are useful placeholders, but their changing anatomy and frame registration cannot produce video-smooth motion. Please make the following *continuous* replacement sheets. Keep Sparky's original face, flame silhouette, eyes and smile; only the blue kimono costume changes.

## Export contract

- One transparent PNG per action, 6 columns × 4 rows, exactly 24 frames; every cell 512 × 512 px (atlas 3072 × 2048 px). Frames run left-to-right, top-to-bottom at 24 fps. Also supply a numbered contact sheet for review. WebP can be made from the approved PNG.
- Sparky faces three-quarter left because he enters from the right side of the screen and plays toward cards on his left. The rightmost edge of his kimono may meet the screen edge, but draw **no black border line** or background in the image.
- Register every frame to the same foot/kimono-hem point: `(340, 486)` in each cell. The face center stays close to `(270, 175)` except for a small intentional squash/stretch. Keep the character's apparent size and camera angle fixed. Fingers, glove, sleeve and flame tips must be identifiable from one frame to the next; no extra limbs or melted shapes.
- Use the exact same palette, line weight, lighting direction and face design across *all* sheets. No shadows outside the transparent cell, text, speech bubbles, card, landscape, generated frame dividers or fake motion echoes. Include 24 distinct frames, not repetitions of 4 poses.
- Keep at least 12 px transparent padding around moving parts. Preserve straight alpha, sRGB, full-resolution originals. Name files `sparky_<action>_24fps.png`.

## Actions to draw

| Sheet | 24-frame acting direction | Game trigger |
| --- | --- | --- |
| `idle` | Gentle breathing; one natural blink; return to the **identical first pose** for a seamless loop. Feet and body anchor stay fixed. | Waiting for a child. |
| `peek_hello` | Enter from the right edge, lean into view, make eye contact, small wave, settle. No teleport between poses. | Home screen and round opening. |
| `think` | Look from first card to the rest of the board, hand near chin, curious brow, tiny head tilt, hold a thoughtful ending. | Sparky plans a pick or watches a child. |
| `throw_star` | Frames 0–4: focus on target. 5–9: wind up the *near* arm. 10–13: extend toward the left. **Frame 14: star releases at the glove tip.** 15–19: follow-through. 20–23: settle without snapping to idle. Draw the glow/star on a separate transparent layer or mark its release coordinate; the game code animates the flying star independently. | Each of Sparky's two picks. Card flips only when the star reaches it. |
| `match_cheer` | Notice the pair, brighten eyes, small joyful hop, wave or clap, land and settle. Preserve Sparky's cute face. | A pair is found. |
| `miss_reassure` | Tiny surprised reaction, kind smile, encouraging nod; never appear disappointed with the child. | Cards do not match. |
| `win_celebrate` | Joyful but gentle celebration, then a stable hold. | Round result. |

All one-shot sheets should start from the same neutral posture as `idle` and finish close enough to it for a natural transition. The last frame must not jump in scale or position. Please include an `animation-notes.md` stating the glove-tip coordinates on throw frame 14 and any deviations from these specs.

## Quality check before delivery

Play each atlas at 24 fps at **its actual in-game size** (about 180–320 px tall, not only enlarged). Step through adjacent frames: Sparky should visibly perform one understandable action, with no flickering outline, drifting feet, changing face, duplicating hands or costume redesign. Loop `idle` five times and verify the seam is invisible. Check `throw_star` frame 14 against its preceding and following frames. Supply a short MP4/GIF preview of each action alongside the lossless atlases.

The current game uses the provided 12-frame sheets while waiting for these replacements. The code's star flight, contact glow and card flip are already separate effects, so the new throw sheet can synchronize to that moment without redrawing the cards.
When integrating `throw_star`, change the game's present wind-up delay from 260 ms to frame 14's timestamp (`14 / 24` seconds, about 583 ms), then launch the separate star from the supplied glove-tip coordinate.
