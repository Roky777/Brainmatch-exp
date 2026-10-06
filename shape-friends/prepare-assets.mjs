// Optional source import, not needed to run the shipped game.
// node shape-friends/prepare-assets.mjs '/path/to/sorting template' '/path/to/generated_images/session'
import { mkdir, readFile, mkdtemp, writeFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [reference, generated] = process.argv.slice(2);
if (!reference || !generated) throw Error('Provide the supplied art folder and the generated-image session folder. Requires cwebp.');
const destination = resolve(dirname(fileURLToPath(import.meta.url)), 'assets');
const originals = {
  football: 'level 3/football.png', ball: 'LEVEL 1+2/ball (1).png', orange: 'level 3/orange.png',
  matchbox: 'level 3/matchbox.png', book: 'level 3/book.png', pencilbox: 'level 3/stationary box.png',
  birthdaycap: 'level 4/birthday_cap.png', papercone: 'level 4/paper_cone.png', funnel: 'level 4/funnel.png',
  glass: 'level 4/drinking_glass.png', waterbottle: 'level 4/water_bottle (1).png',
};
const newArt = {
  beachball: 'exec-e8053899-b529-4a4f-8dfe-a0ca636453eb.png',
  watermelon: 'exec-bba1f6b3-dd26-4737-a920-811ce5ae8a4f.png',
  shoebox: 'exec-72eed347-59bf-44fb-a104-baea51e1f7f5.png',
  icecream: 'exec-970b2cea-5fe4-4220-bd74-d99ad7ee62b9.png',
  notebook: 'exec-543981f2-8638-4939-9ff5-d72a8f3431ab.png',
};
for (const folder of ['items', 'sparky']) await mkdir(resolve(destination, folder), { recursive: true });
function convert(input, output, width, quality = 86) {
  execFileSync('cwebp', ['-quiet', '-q', String(quality), '-alpha_q', '100', ...(width ? ['-resize', String(width), '0'] : []), input, '-o', resolve(destination, output)]);
}
for (const [name, path] of Object.entries(originals)) convert(resolve(reference, 'assets/GRADE 1/maths game', path), `items/${name}.webp`, 384);
for (const [name, path] of Object.entries(newArt)) convert(resolve(generated, path), `items/${name}.webp`, 384);
for (const pose of ['idle', 'thinking', 'happy', 'thumbs-up', 'surprised', 'present-right', 'blink']) convert(resolve(reference, `assets/characters/runtime/sparky-${pose}.png`), `sparky/${pose}.webp`, 0, 90);
convert(resolve(generated, 'exec-7c9da965-bdf0-4480-bd90-97cbcefb2dda.png'), 'picnic-garden.webp', 1536, 83);
convert(resolve(generated, 'exec-e5725218-9926-4201-8558-09cd5a93f331.png'), 'playground-wide.webp', 1536, 87);
convert(resolve(generated, 'exec-7811bf68-0569-48dc-a344-3386357fcfa1.png'), 'playground-portrait.webp', 1024, 87);
convert(resolve(generated, 'exec-2e7a0af9-3505-4f81-a5d3-4a0e902749af.png'), 'sunshine-card.webp', 384, 90);
const characterPoses = { calm: '09_calm_2048 1.svg', thinking: '05_thinking_2048 1.svg', presenting: '07_presenting_2048 1.svg', happy: '02_happy_open_hands_2048 1.svg', correct: '03_wink_thumbsup_2048 1.svg', celebrating: '04_cheer_jump_2048 1.svg', wave: '01_wave_2048 1.svg' };
await mkdir(resolve(destination, 'poses'), { recursive: true });
const extraction = await mkdtemp(resolve(tmpdir(), 'shape-friends-pose-'));
for (const [pose, filename] of Object.entries(characterPoses)) {
  const svg = await readFile(resolve(reference, 'assets/characters', filename), 'utf8');
  const data = svg.match(/data:image\/png;base64,([^"']+)/)?.[1];
  if (!data) throw Error(`Missing embedded artwork: ${filename}`);
  const temporary = resolve(extraction, `${pose}.png`);
  await writeFile(temporary, Buffer.from(data, 'base64'));
  convert(temporary, `poses/${pose}.webp`, 640, 90);
  await unlink(temporary);
}
await rmdir(extraction);
const finalPoses = { ready: 'exec-0da7011c-09c7-47b7-ad92-4c82796992cc.png', think: 'exec-6fa48ccd-aa2d-41fe-8fac-aa6e31dd3dea.png', point: 'exec-4b3f5eb7-32bc-4b70-9144-e824d2914aee.png', cheer: 'exec-912466a8-4f92-49f7-9213-4d17775ea647.png' };
for (const [pose, filename] of Object.entries(finalPoses)) convert(resolve(generated, filename), `poses/${pose}.webp`, 640, 90);
console.log('Prepared all picture objects, cartoon playgrounds, sunshine card, and four final Sparky poses.');
const pictureBook = {
  'book-garden-portrait': ['exec-af2867e5-ccf0-4676-bff9-c9b817fbf788.png', 1024],
  'book-garden-wide': ['exec-65146cd4-e219-4360-bab3-8a4b0260539f.png', 1536],
  'storybook-open': ['exec-02a9fd5a-7290-4954-9644-f3dafe92d9eb.png', 1200],
  'paper-card-back': ['exec-18fd8e0b-f035-49d1-94f9-e9ba1f2bf7ea.png', 384],
};
for (const [name, [filename, width]] of Object.entries(pictureBook)) convert(resolve(generated, filename), `${name}.webp`, width, 87);
const adventure = {
  'adventure-garden': ['exec-679b4b94-0c17-4934-bb0a-8da3bc89f8c8.png', 1920],
  'stone-leaf': ['exec-cfbced4d-7594-4d9f-b853-fae79f342962.png', 384],
  'explorer-costume': ['exec-f373ccfa-7875-4e11-942e-997cf59539d3.png', 640],
};
for (const [name, [filename, width]] of Object.entries(adventure)) convert(resolve(generated, filename), `${name}.webp`, width, 90);
convert(resolve(generated, 'exec-e96b21b6-97f3-46d2-990b-d7006e76b792.png'), 'play-courtyard.webp', 1920, 88);
convert(resolve(generated, 'exec-42a51d6a-455c-43b3-8985-1341ed971d9f.png'), 'star-tile.webp', 384, 90);
