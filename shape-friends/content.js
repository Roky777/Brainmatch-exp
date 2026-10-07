// The first reusable Brain Match content pack. Pictures have no on-card text.
// Source: supplied Brain Match GDD, Grade 1 / Chapter 2, pages 15–16.
export const PACK = {
  id: 'shape-friends-grade-1', version: 1, title: 'Shape Friends',
  subtitle: 'A little picnic with Sparky', grade: 1,
  objective: 'Find two things with the same overall shape.',
  rounds: [
    { id: '1', title: 'Hello, shape friends!', subtitle: 'Different things. Friendly shapes.', pairs: [
      ['round', 'football', 'beachball'], ['box', 'matchbox', 'book'],
      ['cone', 'birthdaycap', 'papercone'], ['cylinder', 'glass', 'waterbottle'],
    ] },
    { id: '2', title: 'Everyday discoveries', subtitle: 'What other things look alike?', pairs: [
      ['round', 'ball', 'orange'], ['box', 'matchbox', 'pencilbox'],
      ['cone', 'birthdaycap', 'funnel'], ['cylinder', 'glass', 'bottle'],
    ] },
    { id: '3', title: 'A picnic surprise', subtitle: 'New things. Shapes you know.', pairs: [
      ['round', 'watermelon', 'ball'], ['box', 'shoebox', 'book'],
      ['cone', 'icecream', 'birthdaycap'], ['cylinder', 'tumbler', 'waterbottle'],
    ] },
    { id: '4', title: 'Our shape celebration', subtitle: 'Let’s bring everyone together.', pairs: [
      ['round', 'orange', 'football'], ['box', 'notebook', 'matchbox'],
      ['cone', 'funnel', 'papercone'], ['cylinder', 'tumbler', 'bottle'],
    ] },
  ],
};

// World two keeps the same memory rules, but changes what the child is
// noticing: two different pictures belong to the same season.
export const SEASON_PACK = {
  id: 'season-parade-grade-1', version: 1, title: 'Season Parade',
  subtitle: 'Which season are they from?', grade: 1,
  objective: 'Find two things that belong to the same season.',
  rounds: [
    { id: '1', title: 'Four happy seasons', subtitle: 'Find friends from the same season.', pairs: [
      ['winter', 'snowman', 'snowflake'], ['spring', 'flower', 'umbrella'],
      ['summer', 'sun', 'popsicle'], ['autumn', 'leaf', 'pumpkin'],
    ] },
    { id: '2', title: 'Weather and play', subtitle: 'What belongs together?', pairs: [
      ['winter', 'mitten', 'sled'], ['spring', 'rainboots', 'butterfly'],
      ['summer', 'sunglasses', 'palm'], ['autumn', 'acorn', 'scarf'],
    ] },
    { id: '3', title: 'Season mix-up', subtitle: 'Look closely and make a pair.', pairs: [
      ['winter', 'snowman', 'mitten'], ['spring', 'flower', 'butterfly'],
      ['summer', 'sun', 'sunglasses'], ['autumn', 'leaf', 'acorn'],
    ] },
    { id: '4', title: 'Season celebration', subtitle: 'Bring every season together.', pairs: [
      ['winter', 'snowflake', 'sled'], ['spring', 'umbrella', 'rainboots'],
      ['summer', 'popsicle', 'palm'], ['autumn', 'pumpkin', 'scarf'],
    ] },
  ],
};

// World three revisits familiar shape families inside a high-contrast neon
// play lab. The learning rule stays identical, so only the visual world is new.
export const NEON_PACK = {
  id: 'neon-shape-lab-grade-1', version: 1, title: 'Neon Shape Lab',
  subtitle: 'Match the glowing shapes', grade: 1,
  objective: 'Find two things with the same overall shape.',
  rounds: [
    { id: '1', title: 'Lights on!', subtitle: 'Find shapes that glow together.', pairs: [
      ['round', 'football', 'orange'], ['box', 'matchbox', 'book'],
      ['cone', 'birthdaycap', 'funnel'], ['cylinder', 'glass', 'waterbottle'],
    ] },
    { id: '2', title: 'Color circuits', subtitle: 'Follow the shape, not the color.', pairs: [
      ['round', 'beachball', 'watermelon'], ['box', 'pencilbox', 'notebook'],
      ['cone', 'papercone', 'icecream'], ['cylinder', 'tumbler', 'bottle'],
    ] },
    { id: '3', title: 'Shape signals', subtitle: 'Look closely and connect a pair.', pairs: [
      ['round', 'ball', 'football'], ['box', 'shoebox', 'matchbox'],
      ['cone', 'funnel', 'birthdaycap'], ['cylinder', 'waterbottle', 'glass'],
    ] },
    { id: '4', title: 'Glow celebration', subtitle: 'Bring every shape light together.', pairs: [
      ['round', 'orange', 'beachball'], ['box', 'book', 'pencilbox'],
      ['cone', 'icecream', 'papercone'], ['cylinder', 'bottle', 'tumbler'],
    ] },
  ],
};

export const THEMES = Object.freeze({
  dream: { id: 'dream', title: 'Dream Meadow', shortTitle: 'Dream', pack: PACK },
  seasons: { id: 'seasons', title: 'Season Parade', shortTitle: 'Seasons', pack: PACK },
  neon: { id: 'neon', title: 'Neon Shape Lab', shortTitle: 'Neon', pack: PACK },
});

export const ITEMS = {
  football: { name: 'Football', asset: 'football', action: 'bounce' },
  beachball: { name: 'Beach ball', asset: 'beachball', action: 'bounce' },
  ball: { name: 'Ball', asset: 'ball', action: 'bounce' },
  orange: { name: 'Orange', asset: 'orange', action: 'roll' },
  watermelon: { name: 'Watermelon', asset: 'watermelon', action: 'roll' },
  matchbox: { name: 'Matchbox', asset: 'matchbox', action: 'slide' },
  book: { name: 'Book', asset: 'book', action: 'open' },
  pencilbox: { name: 'Pencil box', asset: 'pencilbox', action: 'slide' },
  shoebox: { name: 'Shoe box', asset: 'shoebox', action: 'open' },
  notebook: { name: 'Notebook', asset: 'notebook', action: 'open' },
  birthdaycap: { name: 'Birthday cap', asset: 'birthdaycap', action: 'party' },
  papercone: { name: 'Paper cone', asset: 'papercone', action: 'spin' },
  funnel: { name: 'Funnel', asset: 'funnel', action: 'spin' },
  icecream: { name: 'Ice-cream cone', asset: 'icecream', action: 'party' },
  glass: { name: 'Glass', asset: 'glass', action: 'chime' },
  tumbler: { name: 'Tumbler', asset: 'glass', action: 'chime' },
  waterbottle: { name: 'Water bottle', asset: 'waterbottle', action: 'pour' },
  bottle: { name: 'Bottle', asset: 'waterbottle', action: 'pour' },
};

export const SEASON_ITEMS = {
  snowman: { name: 'Snowman', asset: 'snowman' },
  snowflake: { name: 'Snowflake', asset: 'snowflake' },
  mitten: { name: 'Mitten', asset: 'mitten' },
  sled: { name: 'Sled', asset: 'sled' },
  flower: { name: 'Spring flower', asset: 'flower' },
  umbrella: { name: 'Rain umbrella', asset: 'umbrella' },
  rainboots: { name: 'Rain boots', asset: 'rainboots' },
  butterfly: { name: 'Butterfly', asset: 'butterfly' },
  sun: { name: 'Summer sun', asset: 'sun' },
  popsicle: { name: 'Ice pop', asset: 'popsicle' },
  sunglasses: { name: 'Sunglasses', asset: 'sunglasses' },
  palm: { name: 'Palm tree', asset: 'palm' },
  leaf: { name: 'Autumn leaf', asset: 'leaf' },
  pumpkin: { name: 'Pumpkin', asset: 'pumpkin' },
  acorn: { name: 'Acorn', asset: 'acorn' },
  scarf: { name: 'Warm scarf', asset: 'scarf' },
};

export const SHAPES = {
  round: { name: 'Round friends', detail: 'Both are round, like a ball.', color: '#efa761' },
  box: { name: 'Box-shaped friends', detail: 'Both have a box-like shape.', color: '#84b8ac' },
  cone: { name: 'Pointy friends', detail: 'Both taper to a point, like a cone.', color: '#df94a6' },
  cylinder: { name: 'Tall, round friends', detail: 'Both are tall and round, like a cylinder.', color: '#8cb4d1' },
  winter: { name: 'Winter friends', detail: 'Both belong in winter.', color: '#74c9ef' },
  spring: { name: 'Spring friends', detail: 'Both belong in spring.', color: '#70c76b' },
  summer: { name: 'Summer friends', detail: 'Both belong in summer.', color: '#ffc33f' },
  autumn: { name: 'Autumn friends', detail: 'Both belong in autumn.', color: '#ed7d3c' },
};

export function getTheme(id = 'dream') { return THEMES[id] || THEMES.dream; }
export function itemFor(id) { return ITEMS[id] || SEASON_ITEMS[id]; }
export function hasItem(id) { return Boolean(itemFor(id)); }
export function assetURL(id) {
  const item = itemFor(id);
  const folder = ITEMS[id] ? 'items-dream' : 'items-seasons';
  const extension = ITEMS[id] ? 'webp' : 'svg';
  return new URL(`./assets/${folder}/${item.asset}.${extension}`, import.meta.url).href;
}
export function roundById(id, pack = PACK) { return pack.rounds.find(round => round.id === String(id)); }
export function cardsFor(round) {
  return round.pairs.flatMap(([pairId, a, b]) => [a, b].map((item, side) => ({ id: `${pairId}-${side}`, pairId, item })));
}
