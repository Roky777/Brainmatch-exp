# Sparky animation prompts — 10 sheets total

Make **10 deliverable sheets**, not 21: **nine reusable character-motion sheets and one mouth-viseme atlas**. Create one sheet at a time. For each request, paste the shared brief and then exactly one numbered prompt below. Reuse these clips across Practice, Beat Sparky, and results; dialogue and game state decide their meaning. Magic-star travel/contact are code-driven effects, **not additional sprite sheets**.

| # | Sheet | Replaces the old plan |
| --- | --- | --- |
| 01 | `sparky_idle_blink` | Idle/blink |
| 02 | `sparky_arrive_settle` | Arrival |
| 03 | `sparky_talk_loop` | Neutral, excited, and gentle talking body loops |
| 04 | `sparky_invite_turn` | Child-turn invitation |
| 05 | `sparky_observe_think` | Watch card + think/choose |
| 06 | `sparky_wand_pick` | Windup + cast + watch star + recovery |
| 07 | `sparky_pair_joy` | Child pair + Sparky pair |
| 08 | `sparky_gentle_miss` | Miss reaction + handoff |
| 09 | `sparky_result_reaction` | Child win + Sparky win + tie + Practice complete |
| 10 | `sparky_mouth_visemes` | Aligned mouth shapes for all recorded lines |

## Shared production brief — paste before every numbered prompt

> Use case: identity-preserve. Asset type: transparent 2D sprite frames for a portrait mobile memory game for children in classes 1–3. Image 1 is the approved seated kimono Sparky model and must be treated as a strict identity lock, not loose inspiration. Preserve his exact asymmetric yellow/orange-red flame outline, eye spacing and brows, white gloves, cobalt-blue kimono, cream collar, gold sash, shoes, small brown wand and gold star tip. The separate cloud perch is never drawn in a character frame. No background, board, card, dialogue bubble, text, checkerboard, white matte, cast shadow, travelling star, beam, or confetti.
>
> Every character frame uses an identical 512 × 512 px transparent sRGB canvas, fixed camera/scale, at least 24 px transparent padding, straight/unmatted alpha, and a measured seat anchor. Keep hips and feet registered once Sparky is seated; head/flame shape, face proportions, kimono folds, wand length, glove anatomy, and mouth pivot must not morph. Draw genuinely connected in-betweens—eyes lead, head follows, sleeve and wand settle. Do not translate a static character across cells, duplicate poses to meet a frame count, invent extra fingers, or add motion blur. The action must read at **75–95 CSS px** character height.
>
> Deliver individually numbered transparent PNGs, a contact sheet for review, a 24 fps preview at real game size, and `animation-manifest.json` with actual frame durations, loop/hold points, safe handoff frames, `seatAnchor`, `mouthAnchor`, `wandHandPivot`, `wandTip`, and any event marker. Coordinates are frame-local with a top-left origin. Never claim estimated anchors are measured. Verify first/last frames against their neighboring clip; no position, scale, costume, or edge pop is allowed. If only key poses are available, label them **key poses—not finished animation** and name the missing in-betweens.

Attach `assets/animations /Sparky-idle-blink-ambient-v2/sparky_idle_blink_000.png` as the approved `NEUTRAL` model for every prompt. `assets/animations /Sparky-arrive-settle-keyposes-v3/keypose_guide.png` and `assets/animations /Sparky-speaking-loop-fullframes-v1/speaking_loop_contact.png` are **acting references only**. Their intermediate drawings are not approved game frames. The source folder name contains a space before `/`.

### Shared handoffs

- `NEUTRAL`: Sparky seated, eyes open, gentle smile, wand resting. Every one-shot begins or ends here unless a clearly marked handoff says otherwise.
- `OBSERVE_HOLD`: gaze toward a card that was actually revealed. `CHOOSE_HOLD`: gaze committed to the target selected by fair-memory game logic.
- `CAST_RELEASE`: one exact frame and exact `wandTip` point where code launches the separate star. Card flips only when that star reaches the selected card.
- A found pair keeps the **same actor** playing. Sparky can perform `wand_pick` again for his second card or bonus turn without `invite_turn` in between.
- Left, center, and right card targets may be provided as named variants **inside the same sheet package**. They share the same neutral, seat, scale, and timing contract; variants do not increase the sheet count.
- Facial acting comes from the relevant motion sheet. Mouth shapes remain a separate overlay so speech can use the actual recorded-audio timing. Do not create a full-body sheet for every line or result sentence.

## 01 — `sparky_idle_blink`

> Deliver a seamless 12-frame ambient loop from the approved `Sparky-idle-blink-ambient-v2` source, or a correction of it only if needed. Start/end at exact `NEUTRAL`. Hold open eyes for about 2.5 seconds, then one natural open → half → closed → half → open blink, followed by a calm open-eye hold. Tiny flame-tip life is allowed; the seat, feet, wand hand and wand tip do not drift. No speech gesture or repeated blinking every half second. If revising the existing source, fix only genuinely faulty eyelid/edge pixels; do not redesign Sparky or replace a working neutral frame.

## 02 — `sparky_arrive_settle`

> Use `Sparky-arrive-settle-keyposes-v3/keypose_guide.png` **only for acting direction** and `neutral_reference.png` for exact character identity. Draw a new **16-frame one-shot**. Frames 000–006 descend gently from just above/right of the separate perch; eyes find the seat and feet prepare. Frame 007 is `SEAT_CONTACT`; lock the seat/feet anchor from here onward. Frames 008–011 show one restrained 3% landing compression and recovery, no second bounce. Frames 012–014 look toward the child and settle. Frame 015, `NEUTRAL_HANDOFF`, must be **pixel-identical** to `neutral_reference.png` and idle frame 000. The four columns in the guide are not runtime frames; frames 000–014 need coherent new drawings. Preview the entire reveal → landing → idle handoff without a jump.

## 03 — `sparky_talk_loop`

> Make **one** calm 12–16-frame full-body speaking-gesture loop, reusable for greetings, hints, praise and gentle reassurance. The existing `Sparky-speaking-loop-fullframes-v1` is a **rejected acting draft**: its frames 001–012 change the body, face and wand registration. Redraw them against the exact approved neutral; frame 000 and the final frame must be pixel-identical to idle frame 000. Use two small conversational beats only: Sparky meets the child's eyes, inclines his head slightly, opens his free hand once, returns to a listening hold, then settles back to neutral. Keep his seat/feet and wand grip fixed. Do not build excited or sad variants, random waves, or a generic mouth-open/closed loop. Leave a measured, clean mouth region for sheet 10. Change expression through small eye/brow acting in this same sheet; recorded dialogue provides emotional meaning. Preview both `idle → talk → idle` and repeated talk loops at 85 px; reject any frame whose character silhouette or costume changes.

## 04 — `sparky_invite_turn`

> Make a 10–14-frame one-shot for the child's turn and bonus turn. From `NEUTRAL`, Sparky looks at the child, lowers the wand, opens his free palm toward the playable cards, holds a welcoming beat, then returns to `NEUTRAL`. It says “your choice” without pointing at a hidden answer. Stay seated; no cast or travelling star. Mark an `INVITE_HOLD` and clean return frame. Reuse the same action in Practice and Beat Sparky.

## 05 — `sparky_observe_think`

> Make one 12–18-frame attention/decision sheet with two marked hold points. Sparky first watches the card **actually revealed** (`OBSERVE_HOLD`); eyes move before the head. When it is his turn, he quietly compares **observed** cards, shows brief uncertainty, then commits gaze to the chosen card (`CHOOSE_HOLD`). Provide left/center/right target variants inside this package, with identical seat and body registration. For the child's flip, game code holds briefly at `OBSERVE_HOLD` and uses the sheet's marked return-to-`NEUTRAL` frames. For Sparky's pick, it continues to `CHOOSE_HOLD` and then sheet 06. Do not imply he knows unseen cards; no answer glow, pointing line, or random scanning. `CHOOSE_HOLD` must match sheet 06's first pose.

## 06 — `sparky_wand_pick`

> Make **one continuous 24–32-frame pick action** instead of four disconnected sheets. Start at sheet 05's `CHOOSE_HOLD`: small wand windup → short anticipation → clean wand arc → exact `CAST_RELEASE` and measured wand-tip point → follow-through as Sparky watches the separate star → restrained contact reaction → wand settles to `NEUTRAL`. Mark each beat in the manifest. Include a stable `STAR_WAIT_HOLD` after release: game code may hold this pose while the separate star travels to a near or far card, then resume the contact/recovery frames **only when the star reaches that card and its flip begins**. The star, its travel, card impact, and card flip are implemented separately by code; paint none into Sparky's frames. Deliver left/center/right target variants inside this one package; same seat pivot, character scale, wand length and release timing. The result must feel like one video shot, with no hand/wand teleport at any internal beat. Include a safe restart from neutral for Sparky's second pick or extra turn.

## 07 — `sparky_pair_joy`

> Make one 12–18-frame small seated cheer for **either actor** finding a pair. Eyes brighten, Sparky smiles, lifts his free hand once, then returns to `NEUTRAL`. He is delighted for the child and pleasantly pleased when his own memory works—never smug. Dialogue, score and gaze direction distinguish whose pair it was; do not make two full-body sheets. No huge jump, confetti, permanent card line, or separate magical star. Mark the neutral handoff so the same actor can take the next turn immediately.

## 08 — `sparky_gentle_miss`

> Make a 10–14-frame gentle missed-pair response, reusable for a child's miss and Sparky's miss. Eyes register a tiny “not yet” surprise, brows soften, Sparky offers an encouraging smile, and his wand rests. End at `NEUTRAL`; when Sparky misses, sheet 04 may follow to hand the turn to the child. Never shame the child, cry, scold, exaggerate failure, or force a handoff after the child's Practice miss. Keep the pose readable but quiet enough not to interrupt play.

## 09 — `sparky_result_reaction`

> Make one 16–24-frame friendly result-screen reaction for child win, Sparky win, tie and Practice completion. Sparky turns to the child, smiles warmly, gives one modest seated celebration/nod, then holds a stable friendly final pose. Keep it **outcome-neutral**: no gloating when Sparky wins, no sadness when he loses, and no implication that Practice has an opponent. Result text and the recorded line identify the outcome, so this one reusable animation needs no four-way body variants. No score text, trophy, confetti or background baked into frames.

## 10 — `sparky_mouth_visemes`

> Make one separate, aligned mouth atlas for the approved Sparky head—not another full-body animation. Deliver 11 transparent, individually named shapes with identical mouth pivot: `REST` closed smile; `MBP` pressed lips; `A` wide open; `E` wide horizontal; `O` rounded; `U` small rounded; `FV` upper teeth/lower lip; `LTH` simplified tongue/teeth; `S` narrow teeth/smile; `SMILE_OPEN` delighted open smile; `GASP` surprised opening. Supply 2–3 transitional drawings for `REST→A`, `A→O`, and `O→REST` **within this same atlas**. Match the painted face line weight, color and shading. Test every shape over idle and talk frames at an 85 px-tall character. No visible sticker edges, shifting mouth pivot, detached teeth, or arbitrary mouth cycle. Actual MP3/phoneme timing, not audio volume, chooses the shapes; when speech ends, return to `REST`.

## What is intentionally not a separate sheet

No separate excited/gentle talk, watch-card, think-only, windup, cast, star-watch, recover, child-pair, Sparky-pair, or four result sheets. Use the 10 packages above. The cloud perch remains its existing asset. Magic-star launch/travel/contact and subtle pair accents can be drawn or animated in code around the actual selected card; they must not be baked into Sparky's body or hard-code a card position.

## Acceptance gate for every sheet

1. Source PNGs have true alpha, integer canvas dimensions, clear gutters, no clipped wand/glove, and no colored edge halo.
2. Frame-by-frame onion-skin shows stable eyes, flame outline, sash, shoes, seat, wand grip and mouth anchor. The first/last handoff matches the neighboring sheet; no whole-character slide disguised as animation.
3. Preview at 24 fps **and** game size on 320 × 568, 390 × 844 and 480 × 800 portrait screens. Sparky does not cover the turn heading, controls or cards.
4. Manifest times and anchor coordinates are measured from the delivered PNGs, not copied from a guide or invented. `CAST_RELEASE` and `SEAT_CONTACT` refer to real frames.
5. The gameplay sequence reads: observe → choose → continuous wand pick → separate star reaches card → flip → pair/miss reaction → same actor again on a pair.
6. Reduced motion uses a stable seated frame and immediate card flip/brief target cue; it never waits for an invisible animation.

Production order: approve sheet 01's locked neutral, finish sheet 03's corrected speaking loop, then sheet 06's complete wand pick. Add the other sheets after those transitions pass at actual game size. **Do not integrate a review draft merely because it has numbered frames.**
