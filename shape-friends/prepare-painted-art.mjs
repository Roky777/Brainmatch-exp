// Reproducible atlas extraction. Requires cwebp; does not alter the original art.
// node shape-friends/prepare-painted-art.mjs /path/to/generated/session
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const source = process.argv[2];
const dream = process.argv[3] === 'dream';
if (!source) throw Error('Provide the generated-image source directory.');
const assets = resolve(dirname(fileURLToPath(import.meta.url)), 'assets');
const folder = dream ? 'items-dream' : 'items-painted';
await mkdir(resolve(assets, folder), { recursive: true });
const names = ['football','beachball','ball','orange','watermelon','matchbox','book','pencilbox','shoebox','notebook','birthdaycap','papercone','funnel','icecream','glass','waterbottle'];
// Inspected atlas gutters, not inferred equal rows: preserve the cone tips and lids.
const xs = [0,334,636,938,1254], ys = [0,312,596,894,1254];
for (const [i,name] of names.entries()) {
  const col=i%4, row=Math.floor(i/4);
  execFileSync('cwebp', ['-quiet','-q','88','-alpha_q','100','-crop',String(xs[col]),String(ys[row]),String(xs[col+1]-xs[col]),String(ys[row+1]-ys[row]),'-resize','320','0',resolve(source,dream ? 'exec-1ef8e2cb-3444-400c-ace8-137c3c25628d.png' : 'exec-6a770a1f-48d5-41cb-826d-5b02429a8f52.png'),'-o',resolve(assets,`${folder}/${name}.webp`)]);
}
execFileSync('cwebp', ['-quiet','-q','88','-resize','512','512',resolve(source,dream ? 'exec-3ec0c5ea-5e29-486a-bc94-ada50d1da91f.png' : 'exec-89370fb9-0798-442d-a735-5bbbf8b900b2.png'),'-o',resolve(assets,dream ? 'dream-star-card.webp' : 'painted-star-card.webp')]);
// Use the quiet opaque centre of the material, excluding its feathered outer edge.
execFileSync('cwebp', ['-quiet','-q','85','-crop','240','240','774','774','-resize','384','384',resolve(source,'exec-47bd6629-a3e0-412c-b08e-9b64f9c77e9e.png'),'-o',resolve(assets,'ivory-paper.webp')]);
