// Tilly knows only what has been visibly revealed. Hidden card identities never
// enter this module, which keeps her choices fair and easy to test.
export class GuideMemory {
  constructor(entries = []) { this.seen = new Map(entries); }
  remember(index, pairId) { this.seen.set(index, pairId); }
  forgetMatched(pairId) {
    for (const [index, id] of this.seen) if (id === pairId) this.seen.delete(index);
  }
  knownPair(available) {
    const allowed = new Set(available);
    const firstById = new Map();
    for (const [index, pairId] of this.seen) {
      if (!allowed.has(index)) continue;
      if (firstById.has(pairId)) return [firstById.get(pairId), index];
      firstById.set(pairId, index);
    }
    return null;
  }
  hint(available) {
    const pair = this.knownPair(available);
    if (pair) return { type: 'pair', pairId: this.seen.get(pair[0]), indices: pair };
    const known = available.filter(index => this.seen.has(index));
    if (known.length) return { type: 'single', pairId: this.seen.get(known[0]), index: known[0] };
    return { type: 'none' };
  }
}

export function chooseFirst(memory, available, rng = Math.random) {
  const pair = memory.knownPair(available);
  if (pair) return pair[0];
  const unseen = available.filter(index => !memory.seen.has(index));
  const pool = unseen.length ? unseen : available;
  return pool[Math.floor(rng() * pool.length)];
}

export function chooseSecond(memory, available, firstIndex, firstPairId, rng = Math.random) {
  const choices = available.filter(index => index !== firstIndex);
  const knownMate = choices.find(index => memory.seen.get(index) === firstPairId);
  if (knownMate !== undefined) return knownMate;
  const unseen = choices.filter(index => !memory.seen.has(index));
  const pool = unseen.length ? unseen : choices;
  return pool[Math.floor(rng() * pool.length)];
}
