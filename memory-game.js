import { makeDeck } from './game-data.js';
import { GuideMemory } from './guide-ai.js';

export class MemoryGame {
  constructor(roundId, rng = Math.random) {
    this.roundId = roundId;
    this.deck = makeDeck(roundId, rng);
    this.open = [];
    this.matched = new Set();
    this.turn = 'child';
    this.phase = 'ready';
    this.memory = new GuideMemory();
  }
  available() { return this.deck.map((_, index) => index).filter(index => !this.matched.has(this.deck[index].pairId)); }
  reveal(index) {
    if (this.phase !== 'ready' || this.open.includes(index) || !this.available().includes(index)) return null;
    this.open.push(index);
    const card = this.deck[index];
    this.memory.remember(index, card.pairId);
    if (this.open.length === 2) this.phase = 'resolving';
    return card;
  }
  resolve() {
    if (this.phase !== 'resolving') throw new Error('Two cards are required');
    const [first, second] = this.open;
    const pairId = this.deck[first].pairId;
    const match = pairId === this.deck[second].pairId;
    if (match) {
      this.matched.add(pairId);
      this.memory.forgetMatched(pairId);
    }
    this.open = [];
    this.turn = this.turn === 'child' ? 'guide' : 'child';
    this.phase = this.matched.size === 4 ? 'complete' : 'ready';
    return { match, pairId: match ? pairId : null, complete: this.phase === 'complete' };
  }
}
