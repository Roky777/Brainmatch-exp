export const ROUNDS = [
  { id: 1, title: 'Morning in the Meadow', items: ['cow', 'hen', 'hay', 'egg'] },
  { id: 2, title: 'Puddle & Petals', items: ['duck', 'sheep', 'pond', 'flowers'] },
];

export const ITEMS = {
  cow: { name: 'Cow', place: 'near the red barn' },
  hen: { name: 'Hen', place: 'near the fence' },
  hay: { name: 'Hay', place: 'by the barn door' },
  egg: { name: 'Egg', place: 'near the little nest' },
  duck: { name: 'Duck', place: 'near the pond' },
  sheep: { name: 'Sheep', place: 'on the green hill' },
  pond: { name: 'Pond', place: 'at the bottom of the meadow' },
  flowers: { name: 'Flowers', place: 'near the garden path' },
};

export function makeDeck(roundId, rng = Math.random) {
  const round = ROUNDS.find(item => item.id === roundId);
  if (!round) throw new RangeError('Unknown round');
  const deck = round.items.flatMap(pairId => [0, 1].map(copy => ({ id: `${pairId}-${copy}`, pairId })));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [deck[index], deck[swap]] = [deck[swap], deck[index]];
  }
  return deck;
}
