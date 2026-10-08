# Shape Friends UI polish log

This log tracks the finishing passes applied after the baseline alignment fix
(`c10f159`). Each pass follows the same loop: inspect the rendered experience,
record the highest-value issue, implement a focused improvement, and verify the
result before moving on.

## Product goals

- Make every screen feel like one coherent, production-ready experience.
- Keep the primary action obvious and all controls comfortably tappable.
- Preserve the playful Dream Brainmatch character while reducing visual noise.
- Work reliably across common portrait phone sizes and desktop previews.
- Support keyboard navigation, reduced motion, and readable focus states.

## Iteration checklist

- [x] Pass 1 — Entry screen hierarchy and interaction clarity
- [x] Pass 2 — World and difficulty dialogs
- [x] Pass 3 — Gameplay controls, board spacing, and feedback
- [x] Pass 4 — Pause and results experience
- [x] Pass 5 — Responsive and accessibility finishing pass
- [x] Pass 6 — Final regression review
- [x] Pass 7 — Learning objective at the decision point
- [x] Pass 8 — Actionable hint feedback
- [x] Pass 9 — Honest board readiness states
- [x] Pass 10 — Challenge score readability
- [x] Pass 11 — Motion and performance regression
- [x] Pass 12 — Resilient hint control sizing

## Pass 1 — Entry screen hierarchy and interaction clarity

**Finding:** The title and two large actions were attractive, but the decision
group had no visible instruction; its purpose was only available to assistive
technology.

**Upgrade:** Added a compact “Choose how to play” prompt and tuned its spacing,
weight, and contrast so it introduces the actions without competing with the
game title. The visual review caught an initial border collision, so the prompt
was refined into a quiet pill with clear separation from the first action.

## Pass 2 — World and difficulty dialogs

**Finding:** Dialog hierarchy and card alignment were solid, but the close
buttons were lower contrast than the primary surfaces, and world-unlock
guidance looked like passive footer copy.

**Upgrade:** Standardized every dialog close control to a 44px minimum target
with stronger contrast and feedback. Converted the unlock guidance into a
compact status pill and softened locked worlds without sacrificing legibility.

## Pass 3 — Gameplay controls, board spacing, and feedback

**Finding:** Gameplay itself was clean and well balanced, but the implemented
Hint action was permanently hidden by a legacy theme rule. That removed an
important recovery path for young players.

**Upgrade:** Restored Hint as a labeled, high-contrast pill in the safe bottom
corner of the centered game viewport. It remains programmatically disabled
during reveals and computer turns, so its visual and functional states agree.
The first visual check showed the legacy collection container still trapped the
control; Hint was moved to the app shell and verified again.

## Pass 4 — Pause and results experience

**Finding:** The pause dialog was already clear and reassuring. The result card,
however, jumped from a headline directly to a score, while Sparky appeared small
inside a large celebration stage.

**Upgrade:** Added outcome-specific encouragement that explains the achievement,
connected it to the result region for assistive technology, and enlarged Sparky
within a slightly tighter stage for a warmer finish.

## Pass 5 — Responsive and accessibility finishing pass

**Finding:** Core controls already had useful accessible names and focus styles,
but the narrowest phone widths had little tolerance for localized text, and
there were no dedicated increased-contrast or forced-color treatments.

**Upgrade:** Added a 360px compact layout for the menu, level chooser, Hint, and
result card. Added stronger borders, focus rings, progress states, and locked
state treatment for increased-contrast and forced-color environments.

## Pass 6 — Final regression review

**Finding:** Live server logs exposed repeated 404 requests for a nod animation
atlas that had already been deleted from the worktree. The browser otherwise
continued, but this produced noise and could leave Sparky with an empty frame.
Fresh HTML also risked reusing cached module and stylesheet assets.

**Upgrade:** Added an availability probe so `nodYes()` keeps the approved nod
where it ships and uses the existing positive-reaction animation as a graceful
fallback where it does not. Added explicit
asset versions to the page entry point so the finished CSS and module runtime
arrive together after deployment. The live recheck also caught module-graph
caching, so the Sparky dependency itself now carries the release version.

## Pass 7 — Learning objective at the decision point

**Finding:** The board chooser explained card counts but not the learning goal,
so difficulty could be chosen without understanding the task.

**Upgrade:** Added the active world’s learning objective to the level dialog,
connected it through `aria-describedby`, and update it from the current content
pack whenever the world changes.

## Pass 8 — Actionable hint feedback

**Finding:** A hint could highlight cards, but the control itself still said only
“Hint,” making it easy to miss where the help appeared.

**Upgrade:** The control now changes to “Look here” when Sparky remembers a card
and the suggested cards receive a warm, high-contrast glow. When Sparky needs
more information, the control says “Try one” and explains the next step.

## Pass 9 — Honest board readiness states

**Finding:** During Sparky’s arrival and welcome, the board said “Your turn!”
while every card was still disabled.

**Upgrade:** The board now exposes an `aria-busy` state and displays “Getting
ready…” until the welcome finishes and the cards are truly interactive.

## Pass 10 — Challenge score readability

**Finding:** The challenge score compressed both players into one text string,
so ownership and changing numbers were hard to scan.

**Upgrade:** Rebuilt it as a compact two-sided scoreboard with distinct player
labels, larger numbers, a separator, and one concise accessible score label.

## Pass 11 — Motion and performance regression

**Finding:** The latest card feedback added motion to surfaces not covered by
the existing reduced-motion rules.

**Upgrade:** Extended reduced-motion handling across hint pulses, turn lights,
progress pops, loading indicators, card transitions, and control transitions.

## Pass 12 — Resilient hint control sizing

**Finding:** The hint control was sized for the original one-word label, so its
new instructional states could wrap or crowd the icon on compact screens.

**Upgrade:** Made the control grow with its content, kept every hint state on one
line, and retained the existing compact-screen minimum size and touch target.

## Neon theme art-direction refresh

**Finding:** Neon Shape Lab used a bright blue fantasy landscape and chunky
purple depth effects, while the supplied reference was darker, flatter, and
more graphic.

**Upgrade:** Introduced a new optimized space backdrop with a calm central play
area, sparse stars, cyan orbital lines, and neon geometry around the perimeter.
Reworked menus, status chips, dialogs, controls, and result surfaces toward a
near-black material system with cyan outlines, lime title glow, and restrained
pink/yellow accents inspired by the reference.
