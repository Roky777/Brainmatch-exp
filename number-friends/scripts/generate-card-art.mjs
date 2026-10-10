import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const out=fileURLToPath(new URL('../assets/cards/',import.meta.url));
await mkdir(out,{recursive:true});
const shell=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><filter id="s"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#173d79" flood-opacity=".2"/></filter></defs><g filter="url(#s)">${body}</g></svg>`;
const save=(name,body)=>writeFile(`${out}/${name}.svg`,shell(body));
for(let n=1;n<=8;n++)await save(`numeral-${n}`,`<text x="120" y="174" text-anchor="middle" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-size="154" font-weight="900" fill="#2457a6" stroke="#16366e" stroke-width="3" paint-order="stroke">${n}</text>`);
const points=[[120,120],[75,120],[165,120],[75,75],[165,75],[75,165],[165,165],[120,62],[120,178]];
for(const n of [1,2,3,4,8])await save(`dots-${n}`,points.slice(n===1?0:1,n===1?1:n+1).map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="24" fill="${['#ff625f','#25aee4','#ffc43d','#6acb6a'][i%4]}" stroke="#173d79" stroke-width="6"/>`).join(''));
// Object groups use rendered PNG sources. Regenerate them separately with
// `node scripts/compose-quantity-art.mjs` so this script cannot overwrite them.
