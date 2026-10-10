import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const out=fileURLToPath(new URL('../assets/cards/',import.meta.url));
await mkdir(out,{recursive:true});
const shell=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><filter id="s"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#173d79" flood-opacity=".2"/></filter></defs><g filter="url(#s)" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const save=(name,body)=>writeFile(`${out}/${name}.svg`,shell(body));
const text=(value,size=70)=>`<text x="120" y="142" text-anchor="middle" dominant-baseline="middle" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-size="${size}" font-weight="900" fill="#2457a6" stroke="#16366e" stroke-width="2" paint-order="stroke">${value}</text>`;

// Picture cards use the rendered Fluent Emoji PNG assets documented in the
// variant README. This script only regenerates letters and word partners.
for(const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')await save(`letter-${letter.toLowerCase()}`,text(letter,145));
for(const word of ['EYE','EAR','NOSE','HAND','MOUTH','HEAD','LEG','FOOT','SEE','HEAR','SMELL','EAT','CLAP','WALK','MOVE','FEEL'])await save(`word-${word.toLowerCase()}`,text(word,word.length>4?48:word.length>3?57:70));
