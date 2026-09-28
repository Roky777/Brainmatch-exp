# Shape Friends screen design research

Research date: 28 September 2026. References are for interaction principles, not for copying their art, characters, or branding.

## Sources and observations

- [PBS KIDS — Barnyard Match](https://pbskids.org/games/play/barnyard-match/7970): the direct child-facing reference is a single, dominant card board with character companionship. Shape Friends keeps the board as the central action and removes the unrelated collection shelf from play.
- [Apple — Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games/) and [Game controls](https://developer.apple.com/design/human-interface-guidelines/game-controls): game controls should feel part of the play experience, stay consistent, and leave the primary action clear. Shape Friends makes mode, level, play, pause and result distinct scenes rather than one dashboard.
- [Apple — Onboarding for games](https://developer.apple.com/app-store/onboarding-for-games/): get players to meaningful play promptly and introduce choices in context. The opening now asks only Practice or Beat Sparky; the three board sizes appear after that choice.
- [Apple — Adapting your game interface for smaller screens](https://developer.apple.com/documentation/Metal/adapting-your-game-interface-for-smaller-screens): adapt layout to available screen space rather than scaling a desktop arrangement indiscriminately. The portrait scene uses a compact card grid and side companion; short landscape uses a stacked companion caption.
- [Apple — Sago Mini interview](https://developer.apple.com/news/?id=3t6o5jec): this is an example of designing for children's exploratory interactions and observing real children during development. Our current browser QA checks controls and layout, but cannot establish whether children find the game delightful, understandable, or engaging for 30 minutes.

## Applied screen map

| Screen | Primary action | Secondary material |
| --- | --- | --- |
| Home | Choose Practice or Beat Sparky | Animated kimono Sparky peeks from the opposite side |
| Level | Choose Little, Bright or Super spark; then Let's go | Short card-count and difficulty description; Back |
| Play | Flip the large memory cards | Compact turn/score, Sparky's expression and caption, Home and Pause |
| Pause | Keep playing | Voice/effects, Choose a game, grown-up details |
| Result | Play another board | Choose a game, one reward/score message |

No clock or loss penalty is added. In competitive play, finding a pair scores and grants another turn for either player. The game uses an existing dreamy meadow and supplied kimono animation art; the background is not represented as hand-painted. Future visual refinement should use a custom composition fitted to the actual card grid and mascot, then be tested with children and caregivers.
