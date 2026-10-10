import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const out=fileURLToPath(new URL('../assets/cards/',import.meta.url));
await mkdir(out,{recursive:true});
const shell=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><filter id="s"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#173d79" flood-opacity=".2"/></filter></defs><g filter="url(#s)" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const save=(name,body)=>writeFile(`${out}/${name}.svg`,shell(body));
const word=(value,size=64)=>`<text x="120" y="142" text-anchor="middle" dominant-baseline="middle" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-size="${size}" font-weight="900" fill="#2457a6" stroke="#16366e" stroke-width="2" paint-order="stroke">${value}</text>`;
// Picture cards use the polished Fluent Emoji 3D PNG assets documented in
// the variant README. This script only regenerates the typographic partners.
for(const name of ['LION','MONKEY','FISH','FROG','ELEPHANT','RABBIT','BIRD','SNAKE'])await save(`word-${name.toLowerCase()}`,word(name,name.length>6?39:name.length>5?47:62));
