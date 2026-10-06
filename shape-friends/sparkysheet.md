# Sparky — 10-sheet seated kimono animation plan

The supplied seated `Sparky-idle-blink-ambient-v2` sequence is now used in the game beside the turn heading, on the [existing cloud perch](assets/score-perch-v2.png). A code-drawn placeholder star flies from the wand tip to the selected card and **the card flips on star contact**. The other nine sheets below are an art-production plan, not features already implemented. No extensible arm, flying hand or arm-to-card line.

### Supplied ambient v2 idle: integrated

The user's [12 numbered source frames](assets/animations%20/Sparky-idle-blink-ambient-v2/) are transparent 512 × 512 PNGs with a timing/anchor manifest. The game uses a [cropped 4 × 3 WebP runtime atlas](assets/sparky/idle-blink-ambient-v2.webp) with integer-sized cells. The 2.5-second neutral hold and brief blink follow the supplied timing. Keep these source frames and manifest together; do not replace them with the older fractional-cell `idle_blink.png` atlas. The new sequence still needs visual QA alongside future mouth and action clips before those are integrated.

`Sparky-arrive-settle-keyposes-v3` has also been supplied, but its [README](assets/animations%20/Sparky-arrive-settle-keyposes-v3/README.md) labels it a **key-pose guide, not a runtime sheet**. It contains four approximate acting poses and an exact `neutral_reference.png`; the latter is byte-identical to ambient idle frame 000. Frames 000–014 of the proposed 16-frame entrance are still missing. Do not pack the four guide poses or substitute an image-translation entrance; use the detailed sheet 02 prompt in [prompt.md](prompt.md) to produce the registered frames before wiring the entrance into the game.

`Sparky-speaking-loop-fullframes-v1` supplies [14 numbered preview frames](assets/animations%20/Sparky-speaking-loop-fullframes-v1/). A brief in-game trial confirmed that the gesture pops: frames 001–012 vary in body/face/wand registration and use approximate, unmeasured anchors, as its [QA notes](assets/animations%20/Sparky-speaking-loop-fullframes-v1/QA_NOTES.md) warn. It is no longer played at runtime. Voice playback keeps the approved ambient idle until registered frames and separate mouth/timing assets are ready. Sheet 03 in [prompt.md](prompt.md) specifies the correction pass. Do not solve the inconsistency by retiming, crossfading, or sliding the whole character; those mask rather than fix changing drawings.

## Character lock before animation

Approve one seated model sheet (`sparky_model.png`) using the supplied Sparky face as the identity reference: same asymmetric flame, yellow face, eyes, brows, smile, warm red-orange edges and little flame wisps. Dress him in one consistent cobalt-blue kimono with a cream collar and small golden sash. Give him a short warm-wood wand with a tiny golden star tip. His feet, hands, sleeves and wand must belong to one coherent seated character. The reference game's pink character is an **acting reference only**—do not copy its design, staging or UI.

The model sheet needs front and three-quarter seated views, neutral/open-mouth reference, kimono/wand colour swatches, line-weight callouts, a marked seat anchor, wand-hand pivot, wand-tip point and mouth-layer anchor. Approve at **75–95 CSS px character height** against the actual portrait game, not only at full illustration size. The cloud perch is a separate existing asset; never bake it into a character frame.

## The 10 deliverable sheets

Nine sheets contain character motion; the tenth is one aligned mouth atlas. Frame ranges below are planning targets at 24 fps, not repeated drawings to fill a quota. All actions must have compatible seat, head and mouth anchors. Keep the body on the perch; the wand may move, but the seat must not drift. Directional variants live **inside** the relevant sheet package and do not increase this count.

| # | Sheet / clip | Frames | Acting and game trigger |
| --- | --- | ---: | --- |
| 01 | `sparky_idle_blink` | 12 | Supplied ambient v2; long open-eye hold and one natural blink. This is the only integrated sheet. |
| 02 | `sparky_arrive_settle` | 16 planned | V3 is a guide only. Draw registered frames 000–014; `SEAT_CONTACT` at 007 and 015 pixel-identical to idle 000. |
| 03 | `sparky_talk_loop` | 12–16 | One restrained speaking-body loop for all lines. Redraw the rejected v1 intermediates; mouth is sheet 10. |
| 04 | `sparky_invite_turn` | 10–14 | Open palm, wand lowered, child chooses; reuse after a child bonus turn. |
| 05 | `sparky_observe_think` | 12–18 | Watch the revealed card, then—on Sparky's turn—choose among observed positions. Mark `OBSERVE_HOLD` and `CHOOSE_HOLD`. |
| 06 | `sparky_wand_pick` | 24–32 | **One continuous** windup → cast → star-watch → recovery action. Mark `CAST_RELEASE`, wand tip and a `STAR_WAIT_HOLD` paused until real card contact. Use twice if needed. |
| 07 | `sparky_pair_joy` | 12–18 | One small cheer for either actor's pair; dialogue distinguishes whose pair it was. A pair keeps that actor's turn. |
| 08 | `sparky_gentle_miss` | 10–14 | Tiny “not yet” reaction for either actor; sheet 04 follows only when handing play to the child. |
| 09 | `sparky_result_reaction` | 16–24 | Warm, outcome-neutral result celebration; text/voice identify win, loss, tie or Practice completion. |
| 10 | `sparky_mouth_visemes` | atlas | Aligned mouth shapes for real recorded-dialogue timing; not another full-body animation. |

Do not create extra excited/gentle talk, separate watch/think/windup/cast/recover, actor-specific pair, or outcome-specific result sheets. Eye/brow emotion is drawn in the relevant motion frames, not a separate face atlas. The first production milestone is correcting sheet 03 and completing the continuous sheet 06 against the already approved neutral; do not show random waves or unrelated reactions during card selection.

## Mouth shapes for real dialogue

Sheet 10 is one `sparky_mouth_visemes` atlas, all aligned to the same mouth anchor and at the same head scale. The motion sheets supply eye/brow emotion; mouth shapes alone are not enough. Required shapes:

| ID | Shape | Speech use |
| --- | --- | --- |
| `REST` | Relaxed closed smile | Silence and listening. |
| `MBP` | Fully closed lips | M, B, P. |
| `A` | Wide open mouth | Ah / strong open vowels. |
| `E` | Wide horizontal mouth | Ee / eh. |
| `O` | Round open mouth | Oh / aw. |
| `U` | Small round mouth | Oo / w. |
| `FV` | Upper teeth to lower lip | F, V. |
| `LTH` | Tongue/teeth indication | L, TH; simplify if unreadable at 85 px. |
| `S` | Narrow teeth/smile | S, Z, sh, ch. |
| `SMILE_OPEN` | Open delighted smile | Hooray, laughing emphasis. |
| `GASP` | Small surprised opening | “Oh”, “Oops” reaction before speech. |

Supply 2–3 in-between mouth drawings for major changes such as `REST→A`, `A→O` and `O→REST`, so the mouth does not snap mechanically. Mouth pivots and visible teeth/tongue style must be consistent. At actual size, avoid tiny over-detailed lip drawings; readable shape changes matter more. **Do not** create a generic random mouth cycle or claim that audio amplitude alone is lip sync.

## Complete dialogue script for the wand version

These are **proposed replacement lines**, not audio already in the game. Aim for an unhurried, expressive 2–4-second delivery per line. The current build has [21 earlier English MP3s](voice/renders/) keyed by their exact text in [audio.js](audio.js); changing to this script requires new recordings, updated text/audio mapping and new lip-sync timing. The last two rows cover current on-screen situations that do not yet have dedicated recordings. Do not swap these words into code while leaving the old MP3s attached.

| Clip ID | When it plays | Final proposed line | Face / action |
| --- | --- | --- | --- |
| `hello` | Child taps Sparky / greeting | “Hi, friend! Ready to find some shape pairs?” | Smile, meet the child’s eyes. |
| `practice-start` | Practice begins | “Let’s practise together. Pick any two cards!” | Welcoming, open palm. |
| `challenge-start` | Beat Sparky begins | “Ready to play against me? You go first!” | Playful smile, invite turn. |
| `welcome` | Board introduction | “Welcome, friend! Let’s find shape pairs together.” | Gentle introduction, glance at board. |
| `your-turn` | Child’s turn begins | “Your turn! Which two cards will you try?” | Look to child, then board. |
| `wonder` | First card revealed, occasional prompt | “Hmm, what could match the one you found?” | Curious eyes follow that card. |
| `my-turn` | Sparky begins choosing | “My turn! Let me think... I’ll try this one.” | Thinking glance → wand windup. |
| `match` | Child finds pair, variant A | “They match! You remembered where they were!” | Delighted smile, small cheer. |
| `match-wow` | Child finds pair, variant B | “Oh, brilliant! You spotted another shape pair!” | Bright eyes, proud of child. |
| `sparky-found` | Sparky finds pair | “I found a pair! My memory worked!” | Pleased, then look back to board. |
| `sparky-match` | Sparky pair / picnic-themed variant | “These two belong together! What a lovely pair.” | Pleased, never smug. |
| `remember` | Child misses, variant A | “Not a pair yet. Now we know both cards.” | Kind, thoughtful. |
| `miss-kind` | Child misses, variant B | “Those aren’t a pair, but we’ll remember them.” | Reassuring smile. |
| `sparky-oops` | Sparky misses | “Oops, I missed that pair. Your turn!” | Tiny surprise → friendly handoff. |
| `hint-known` | Valid observed-memory hint | “I remember seeing those two. Try them!” | Point only to genuinely observed cards. |
| `hint-look` | No known pair for a hint | “I’m still learning too. Let’s turn another card.” | Curious, no answer-pointing. |
| `next` | Next board opens | “A new board! You get the first pick.” | Fresh excitement, invite turn. |
| `win` | Child beats Sparky | “You found more pairs than me! Wonderful playing!” | Big warm celebration. |
| `lose` | Sparky wins | “I found more this time. Want another round?” | Modest smile, playful invitation. |
| `tie` | Same score | “It’s a tie! We remembered together.” | Shared delight. |
| `practice-done` | Practice board complete | “Every pair is found. You did it!” | Celebrate child’s effort. |
| `resume` **new recording** | Resume after pause | “We’re back! Let’s see what we remember.” | Calm return, look at board. |
| `picnic-empty` **new recording** | Empty picnic basket tapped | “Let’s find a shape pair for our picnic!” | Light invitation, no pressure. |

Use no speech for every routine card flip: a soft flip sound and Sparky’s eyes following the card are enough. Do not interrupt a line with the next automatic line; allow a brief listening hold between thoughts. In Practice, never say that Sparky gets a turn. In Beat Sparky, a matched pair lets its finder play again. A result line must reflect the actual winner or tie. Reuse the body-action sheets above; do **not** draw a unique full-body sheet for every sentence.

Each newly recorded line needs a timing sidecar (`voice/sync/<clip-id>.json`) with word and viseme intervals, expression/gesture cues, audio duration and an end hold. The actual recorded audio—not text length—is the timing source. If some old recordings are retained, align those exact files and keep their exact captions; do not pair a revised caption with mismatched speech. Do not stretch speech to force an animation duration.

### Lip-sync timing contract

Each sidecar must identify the exact MP3, its duration, and `startMs`/`endMs` for every viseme in chronological order. Add independent expression and gesture events at meaningful words (for example, smile on “They match!”, surprised eyes on “Oops”). A neutral/listening pose holds before speech; the mouth returns to `REST` immediately after audio ends. Pause freezes audio, body, face, mouth, wand and travelling star on the same timeline; resume keeps them together. Muting voice should suppress mouth speech animation, though a nonverbal smile or gesture may still play. Repeated lines reuse their own timing data. Device-speech fallback cannot use MP3 timing; use a modest generic speaking animation only for that fallback, labelled as approximate.

Example sidecar shape (illustrative times, **not** timing for the real MP3):

```json
{
  "audio": "voice/renders/sparky-found-v2.mp3",
  "durationMs": 1360,
  "visemes": [
    { "startMs": 0, "endMs": 110, "id": "REST" },
    { "startMs": 110, "endMs": 210, "id": "A" },
    { "startMs": 210, "endMs": 290, "id": "MBP" }
  ],
  "cues": [
    { "atMs": 110, "expression": "delighted" },
    { "atMs": 720, "gesture": "pair_joy" }
  ]
}
```

## Magic effects without more sprite sheets

The selected card is determined by fair-memory game logic. Code animates one small star from sheet 06's measured `CAST_RELEASE` wand tip to that card while Sparky holds `STAR_WAIT_HOLD`, adds a restrained local contact cue, then flips the card and resumes Sparky's recovery frames. Code may add a brief card-local pair accent. The star, contact and pair accent are **not additional deliverable sprite sheets** and are never baked into Sparky's character frames. No fixed card target or permanent line between pairs.

## File and QA contract

- Prefer numbered transparent PNG frames per clip (`sparky_wand_pick_000.png`, etc.), plus a packed atlas, numbered contact sheet and MP4/GIF preview. Use identical 512 × 512 px character cells, fixed scale/camera/seat pivot, at least 24 px transparent padding, straight alpha and sRGB. Keep source layers (PSD/ORA or equivalent).
- Supply `animation-manifest.json`: frame order, per-frame duration, loop/hold points, seat and mouth anchors, wand-hand pivot, wand-tip positions, `SEAT_CONTACT`, `CAST_RELEASE`, safe interruption points and layer order. Coordinates use top-left pixel origin; say whether they are frame-local or atlas-local.
- Preview at 24 fps **and** actual game size on 320 × 568, 390 × 844 and 480 × 800 portrait screens. Inspect the face at 85 px tall; every expression and major viseme should read. Check 4-, 6- and 8-card layouts, nearest/farthest/leftmost/rightmost targets, and heading/control clearance.
- The card sequence must read: observe/choose → continuous wand pick with star release → code-driven star travel → contact → flip → pair/miss reaction. Sparky stays seated; his wand and body never teleport between frames. A found pair keeps the same actor’s turn.
- Reduced motion: hold a stable seated pose, show a short target highlight and immediate flip. No travelling star or large gesture. Never delay input for an invisible animation.
- Do not silently reuse old floating-flame, reaching-hand or blue-rod assets. They are legacy studies. Integration is complete only after real dialogue timing and art previews are checked together.
