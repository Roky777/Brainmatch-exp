# Money Match

Launch with `npm start`, then open `/money-match/` or select Money Match in the game library.

Easy: 4 cards, coins and notes. Medium: 6 cards, adding totals. Hard: 8 cards, different currency combinations of equal value. Each difficulty cycles through two content boards; each play samples pairs so all supplied denominations and combinations can appear.

Practice earns 7 XP per first board clear; Beat Sparky earns 4 XP. Across three worlds and six boards, plus a 2 XP completion bonus, the journey totals 200 XP. Progress is saved independently from other variants.

Card art is original labelled educational SVG artwork, not scans of legal tender. Note colours distinguish ₹10 brown, ₹20 yellow-green, ₹50 blue and ₹100 purple. Combination cards show each denomination, never a hidden total. Rebuild art with `node money-match/scripts/generate-card-art.mjs`.

The incomplete master-board rows in the brief use the established equal-value combinations for ₹6, ₹7, ₹8 and ₹10. Each board has distinct totals to ensure one valid match per card.
