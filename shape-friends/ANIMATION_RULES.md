# Shape Friends — Animation System & Rule Specification

This document defines the complete state machine, triggering rules, timings, priority stack, and hand-off behaviors for all animations in **Brain Match: Shape Friends** across all three themes (**Dream Meadow**, **Season Parade**, and **Neon Shape Lab**).

---

## 1. Core Principles & Philosophy

1. **Child-Centered Pacing**: Animations must never lock player input unnecessarily. Character acting and vocalizations run as ambient feedback, releasing the board as soon as cards are visually legible.
2. **Seamless Handoffs**: Adjacent clips must share pixel-identical registration frames (e.g., `observe_think` Frame 015 is pixel-identical to `wand_pick` Frame 000). There must never be a single-frame flash or jump back to idle during a continuous action.
3. **Gentle, Reassuring Feedback**: Non-matching turns never show harsh red buzzers, angry shakes, or punitive sounds; Sparky performs a soft head-tilt reassurance (`gentle-miss`).
4. **Theme-Invariant Motion**: The animation timings, state machine, and interaction geometry are 100% identical across Dream Meadow, Season Parade, and Neon Shape Lab. Themes only reskin the materials and particles.
5. **Accessibility-First**: When `prefers-reduced-motion: reduce` is active, large body motion freezes to authored neutral poses while phonetic lip sync remains readable.

---

## 2. Sparky Character Animation State Machine

Sparky is seated on the ledge/cloud at `seatAnchor = (256, 300)` on a 512×512 canvas. He supports 9 authored animation states:

| State / Clip | Spritesheet Atlas | Frame Grid | Total Duration | Trigger Condition (When) | Resolution & Handoff (What Happens Next) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`idle`** | `sparky_wall_idle_blink_formal_atlas_v1.png` | 4 × 4 (16 frames) | 3326 ms (looping) | Default resting state when no action, speech, or turn transition is active. | Loops infinitely. Blink occurs on frames 6–13 (42–84 ms/frame). Frame 015 is pixel-identical to Frame 000. |
| **`arrive`** | `sparky_wall_arrive_settle_atlas.png` | 5 × 4 (20 frames) | 833.3 ms (24 fps) | New round/level start (`enteringPlay === true`). | Descends from above; seat contact at Frame 007; settles at Frame 008; neutral handoff at Frame 019 directly into `idle` / welcome narration. |
| **`talk`** | `sparky_wall_invite_turn_atlas.png` | 4 × 4 (16 frames) | Dynamic (audio clip length + 1083 ms) | Whenever Sparky speaks a standalone voice line (`say()`, `speakLine()`). | Frames 0–7 (intro, 958 ms) → Frame 008 held for active speech duration → Frames 9–15 (recovery, 1083 ms) → returns to `idle`. |
| **`observe`** | `sparky_wall_observe_think_v2` (`atlas_left`, `atlas_center`, `atlas_right`) | 4 × 4 (16 frames) | 1510 ms (2416.7 ms @ 1.6× speed) | Sparky's turn, before choosing and casting the second card. | Direction chosen by target column (`left`, `center`, `right`). Chin touch on Frame 007; Frame 015 handoff cuts directly into `wand-pick` Frame 000 with zero flash. |
| **`wand-pick`** | `sparky_wall_wand_pick` (`atlas_left`, `atlas_center`, `atlas_right`) | 6 × 4 (24 frames) | ~1420 ms total (raise 444 ms + travel 420 ms + recovery 555 ms @ 1.5×) | Sparky taps/selects a card during Sparky's turn. | Frames 0–9 raise wand; Frame 010 spawns independent traveling star; Frames 14–16 held until star hits card; Frames 17–23 wand recovery → `idle`. |
| **`pair-joy`** | `sparky_wall_pair_joy_atlas.png` | 4 × 4 (16 frames) | 1750 ms (or audio duration + 750 ms) | Any matching pair is found (Child or Sparky). | Frames 0–7 intro (666.7 ms) → Frame 008 celebratory peak hold (extended if voiced) → Frames 9–15 recovery (750 ms) → `idle`. |
| **`gentle-miss`** | `sparky_wall_gentle_miss_atlas.png` | 4 × 4 (16 frames) | 1916.7 ms (or audio duration + 750 ms) | Two non-matching cards are flipped (mismatch). | Frames 0–9 intro (833.3 ms) → Frame 010 soft head-tilt reassurance hold → Frames 11–15 recovery (750 ms) → `idle`. |
| **`nod-yes`** | `sparky_wall_nod_yes/atlas.png` | 4 × 3 (12 frames) | 976 ms (one-shot) | 1. Subsequent match in a round (approving silent nod instead of repetitive talk).<br>2. Subsequent miss in a round (polite acknowledging nod, standing in for nod-no).<br>3. Turn passes to child ("Your turn!").<br>4. Hint button tapped.<br>5. Sparky tapped during play.<br>6. Resuming from pause/picnic break. | Frames 0–3 intro → Frame 004 YES_BEAT → Frame 008 YES_HOLD → Frame 011 neutral handoff → returns cleanly to `idle`. |
| **`result-reaction`** | `sparky_wall_result_reaction_atlas.png` | 5 × 4 (20 frames) | 1291.7 ms intro → Freeze | All pairs found; board complete; Result dialog displayed. | Frames 0–8 intro → Frame 009 happy peak → Frame 016 friendly pose frozen indefinitely while result modal stays open. |

---

## 3. Real-Time Lip Sync & Viseme Overlay

- **Atlas**: `mouth_runtime_atlas.png` (1280×1024, 17 phonetic mouth shapes).
- **Cleanup**: `base_mouth_cleanup.png` (512×512) masks the base sprite's drawn mouth.
- **Rule**:
  - Independent of body pose: Sparky speaks naturally during `talk`, `pair-joy`, `gentle-miss`, and `result-reaction`.
  - Mouth shapes are derived from English text grapheme parsing and aligned with audio durations.
  - Pauses > 120 ms automatically close mouth to `REST`.
  - Recovery frames (frames 9+ of `talk`) automatically hide the viseme overlay to reveal the authored clean recovery mouth.

---

## 4. Board & Card Animation System

| Element | Animation / Class | CSS Keyframe / Duration | Trigger Condition (When) | Behavior & Payoff |
| :--- | :--- | :--- | :--- | :--- |
| **Board Arrival** | `.memory-board` | `cards-arrive` (400 ms ease-out) | Round start / board unveil | Cards scale up from 0.94 to 1.0 and fade in (opacity 0 → 1). |
| **Card Flip Open** | `.memory-card.is-open` | `rotateY(180deg)` (320 ms cubic-bezier) | Card tapped by child or targeted by Sparky | Smooth 3D perspective flip from card-back to card-front. |
| **Card Art Loading** | `.card-front.is-loading` | `card-art-wait` (pulse, infinite) | Card flipped before image decode finishes | Subtle scale breathing (0.9 → 1.04) ensuring card is never blank. |
| **Hint Glow** | `.memory-card.hinted` | `card-choice-glow` (1.2s infinite alternate) | Child taps Hint button | Luminous glowing border highlighting known cards. Clears immediately upon next tap. |
| **Wand Contact** | `.memory-card.targeted` | `touch-spark` (350 ms) | Sparky's magic star hits card | Star burst particle appears at card center on contact. |
| **Pair Matched** | `.memory-card.just-matched` | `pair-found-pulse` (scale 1.08 → 1.0, 420 ms) | Two matching cards resolved | Both cards pulse; `.match-check` springs up with `check-spring` (scale 0.4 → 1.2 → 1.0); 4 radial stars expand outward (`card-burst-star`). |
| **Card Flip Back** | Mismatch closing | `rotateY(0deg)` (320 ms) | Two non-matching cards resolved | Held open for 900 ms reading window (`CARD_REVEAL_HOLD_MS`), then smoothly rotate back. Previous art retained for first 210 ms of flip. |
| **Discovery Flight** | `.flying-discovery` | 450 ms Bezier curve | Pair matched in Dream Meadow | Item thumbnail clones and flies from board position into picnic basket tray. |

---

## 5. UI, Feedback & Modal Transitions

| UI Element | Animation / Keyframe | Duration | Trigger Condition (When) | Visual Result |
| :--- | :--- | :--- | :--- | :--- |
| **Dialog Opening** | `dialog[open]` (`level-pop-in`) | 240 ms ease-out | Any modal opened (`Level`, `Theme`, `Settings`, `Unlock`, `Result`) | Smooth slide-up (`translate: 0 12px → 0 0`) and scale-up (`scale: 0.95 → 1.0`) with backdrop blur fade-in. |
| **Locked Theme Tap** | `button.is-locked` (`locked-nudge`) | 350 ms | Tapping a locked world in the theme chooser | Gentle horizontal wiggle (-5px → +5px → -3px) signaling locked status without harsh errors. |
| **Turn Indicator Change** | `#turn-chip` (`turn-pulse`) | 400 ms | Actor changes (`child` ↔ `sparky`) | Subtle luminous pulse highlighting who plays next. |
| **Progress Dot Pop** | `#pair-progress i.found` (`gem-pop`) | 300 ms spring | New pair found | Found dot pops into place with scale bounce (0.6 → 1.3 → 1.0). |
| **Confetti Shower** | `.confetti-piece` (`confetti-fall`) | 1.8s–2.4s staggered | Round complete / Result dialog shown | Celebratory confetti drifts down the screen. |

---

## 6. Priority Stack & Interruption Rules

When multiple animation requests occur simultaneously, the system resolves them according to this strict hierarchy:

1. **Pause / Settings Open (Highest Priority)**:
   - Freezes all active timers (`timeline.pause()`), pauses character tick, stops audio immediately.
   - Resuming unfreezes from exact timestamp.
2. **Result Celebration**:
   - Board complete locks interaction; overrides idle; freezes character on `result-reaction` Frame 016.
3. **Turn Resolution Alternating Cadence (`Voice` ↔ `Nod`)**:
   - **Odd turns (Match 1, 3... / Miss 1, 3...)**: Voiced praise or reassurance + full character acting (`pairJoy` or `gentleMiss`) with lip sync.
   - **Even turns (Match 2, 4... / Miss 2, 4...)**: Silent gesture reaction (`nodYes()`) + brief status caption. Never locks gameplay and never repeats voice clips back-to-back.
   - **Prevents Silence**: Voice returns every other match/miss, keeping the game lively without being repetitive.
4. **Non-Interruption & Animation Isolation Guards**:
   - `nodYes()` is guarded against firing when Sparky is actively speaking (`this.speechActive`), casting a wand, or in result celebration.
   - Handover to child turn does NOT fire a redundant second nod if Sparky just reacted to the match or miss.
   - User interactions (`hint`, clicking Sparky, picnic basket) play clear speech without clashing mid-motion with nodding.
5. **Sparky Cast (`observe` → `wand-pick`)**:
   - Atomic animation sequence during Sparky's turn. Input is locked while star is in flight.
6. **Idle & Blink (`idle`) (Lowest Priority)**:
   - Resumes automatically whenever no active gesture is playing.

---

## 7. Reduced Motion Accessibility Rules (`prefers-reduced-motion: reduce`)

When reduced motion is enabled:
- **Sparky**:
  - `idle`: Freezes on Frame 000 (no blinking/chest motion).
  - `arrive`: Jumps directly to Frame 019 (neutral resting pose).
  - `observe`: Jumps to Frame 004 (observing hold).
  - `wand-pick`: Instant target highlight; jumps to Frame 023.
  - `pair-joy`: Displays static Frame 008 (smile).
  - `gentle-miss`: Displays static Frame 010 (reassuring smile).
  - `result-reaction`: Displays static Frame 016.
  - `nod-yes`: Displays static Frame 000.
- **Lip Sync**: Subtle mouth visemes still render at reduced rate for visual speech comprehension.
- **Board/Cards**: Card flip transitions become instant; star projectile flight is bypassed; confetti is suppressed.
