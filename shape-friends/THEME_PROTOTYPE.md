# Dream play-screen prototype

This is a *visual prototype*. The borrowed idea from the supplied math-game reference is limited to its clarity: one focal play area and compact readable progress. The game does not reproduce that game's graph paper, keypad, layout, colours, typography, score badges, or music.

Previews: [menu](previews/dream-prototype-menu-390x844.png), [level choice](previews/dream-prototype-levels-320x568.png), [390 × 844 play screen](previews/dream-prototype-play-390x844.png), [320 × 568 play screen](previews/dream-prototype-play-320x568.png), [pause](previews/dream-prototype-pause-390x844.png), and [result](previews/dream-prototype-result-390x844.png).

## Visual language

- Primary identity: a luminous, airy dream among clouds. Warm ivory, misty periwinkle, pale lilac, and a little peach-gold.
- No dark frame: the cards sit on one warm-white play surface with only a hairline edge. Turn and score sit above it. This restores a clear play hierarchy without copying the reference's grid or keypad.
- The dot-paper texture is barely visible. The actual lavender-blue cloud painting stays saturated around a translucent warm-white play surface; periwinkle cards have clear indigo edges and golden stars. The contrast is intentional and playful without the previous glossy-card noise.
- Sparky, his reach, and the dialogue bubble are temporarily hidden on the play screen at the user's request. The underlying opponent/game logic and supplied animation assets remain in place for a later character pass; no replacement sprite sheet is implied here.
- Menu, level choice, result, and pause now share the same cloud-corner background, light surfaces, restrained shadows, and readable center. The setup-page Sparky is also temporarily hidden.
- Opening a round parts two code-drawn cloud banks to reveal the board. It lasts about 1.6 seconds, cannot leave a stale covering layer after returning home, and is skipped for reduced-motion users. This is an original transition, not reused Clash of Clans art or motion.

## Sound direction for the next pass

Original, unhurried dream music: a soft music-box/celesta motif over an airy pad, around 68–76 BPM, with long pauses between phrases. Gentle match chimes can answer the motif; mismatches should never sound punitive. Keep music beneath Sparky's voice, duck it when he speaks, pause/mute it with the game's sound controls, and never reuse the reference video's melody or recording. This prototype does not ship a new music track.

## Review gate

Judge the portrait flow at 320 × 568 and 390 × 844: are the choices and cards clear, do the cloud corners and dots feel dreamy without clutter, and is the cloud opening pleasantly quick? Reintroduce Sparky and dialogue only after their position and animation are agreed.
