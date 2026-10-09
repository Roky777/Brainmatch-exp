# Brain Match content variants

The matching engine is content-neutral. All child-facing card data lives in
[`game-content.json`](game-content.json).

## General content names

- `variant`: the game’s identity, title, grade and learning objective.
- `worlds`: display names and presentation-skin metadata. World IDs are stable
  save keys; visible names can change freely.
- `categories`: the rule that makes two cards a pair. For Flag Friends these
  could be `same_country`, `same_colors` or `same_symbol`.
- `items`: card names, image paths and optional play actions.
- `rounds`: arrays of `[categoryId, firstItemId, secondItemId]` pairs.

## Make a new variant

1. Duplicate the `shape-friends` folder.
2. Edit `variant`, `categories`, `items` and `rounds` in `game-content.json`.
3. Put the referenced images under `assets/` and set each item’s `asset` path.
4. Keep at least four pairs in every round so Easy, Medium and Hard can draw
   2, 3 and 4 pairs.
5. Run `npm test` from the repository root.

Example pair for a flag variant:

```json
["same_country", "india_flag", "india_map"]
```

No changes to `app.js`, `engine.js`, the flip logic, Sparky, XP or save handling
are required when item IDs, assets, categories and round pairs are changed.
