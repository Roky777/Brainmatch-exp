import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUNDS, makeDeck } from '../game-data.js';
import { MemoryGame } from '../memory-game.js';

test('both rounds contain four identical pairs and shuffle safely', () => {
  assert.deepEqual(ROUNDS.map(round => round.items.length), [4, 4]);
  for (const round of ROUNDS) {
    for (let run = 0; run < 40; run += 1) {
      const deck = makeDeck(round.id);
      assert.equal(deck.length, 8);
      for (const item of round.items) assert.equal(deck.filter(card => card.pairId === item).length, 2);
    }
  }
});

test('matches, mismatches, completion, and strict alternation work', () => {
  const game = new MemoryGame(1, () => 0.5);
  game.deck = ['cow','cow','hen','hay','hen','hay','egg','egg'].map((pairId, index) => ({ id: `${pairId}-${index}`, pairId }));
  game.reveal(0); game.reveal(1);
  assert.deepEqual(game.resolve(), { match: true, pairId: 'cow', complete: false });
  assert.equal(game.turn, 'guide');
  game.reveal(2); game.reveal(3);
  assert.equal(game.resolve().match, false);
  assert.equal(game.turn, 'child');
  for (const pair of [[2,4],[3,5],[6,7]]) {
    game.reveal(pair[0]); game.reveal(pair[1]); game.resolve();
  }
  assert.equal(game.phase, 'complete');
  assert.equal(game.matched.size, 4);
});

test('rapid or invalid flips cannot corrupt the board', () => {
  const game = new MemoryGame(1);
  assert.ok(game.reveal(0));
  assert.equal(game.reveal(0), null);
  assert.ok(game.reveal(1));
  assert.equal(game.reveal(2), null);
  game.resolve();
  assert.equal(game.open.length, 0);
});
