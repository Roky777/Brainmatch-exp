import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const out=fileURLToPath(new URL('../assets/cards/',import.meta.url));
await mkdir(out,{recursive:true});
const shell=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><filter id="s"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#173d79" flood-opacity=".2"/></filter></defs><g filter="url(#s)">${body}</g></svg>`;
const save=(name,body)=>writeFile(`${out}/${name}.svg`,shell(body));
for(let n=1;n<=8;n++)await save(`numeral-${n}`,`<text x="120" y="174" text-anchor="middle" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-size="154" font-weight="900" fill="#2457a6" stroke="#16366e" stroke-width="3" paint-order="stroke">${n}</text>`);
const points=[[120,120],[75,120],[165,120],[75,75],[165,75],[75,165],[165,165],[120,62],[120,178]];
for(const n of [1,2,3,4,8])await save(`dots-${n}`,points.slice(n===1?0:1,n===1?1:n+1).map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="24" fill="${['#ff625f','#25aee4','#ffc43d','#6acb6a'][i%4]}" stroke="#173d79" stroke-width="6"/>`).join(''));
const layouts={1:[[120,120]],2:[[78,120],[162,120]],3:[[120,63],[72,154],[168,154]],4:[[72,72],[168,72],[72,168],[168,168]],5:[[70,68],[170,68],[120,120],[70,172],[170,172]],6:[[65,62],[120,62],[175,62],[65,166],[120,166],[175,166]],7:[[60,60],[120,60],[180,60],[86,120],[154,120],[86,180],[154,180]],8:[[60,58],[120,58],[180,58],[77,115],[163,115],[60,177],[120,177],[180,177]]};
const icons={
 apple:`<path d="M-20-6C-31-27-49-9-43 14c6 24 25 35 43 20 18 15 37 4 43-20 6-23-12-41-32-20C5-13-5-13-20-6Z" fill="#f25d58" stroke="#173d79" stroke-width="5"/><path d="M2-11q3-18 18-23M5-20q15-12 27-1" fill="none" stroke="#3c8b53" stroke-width="7" stroke-linecap="round"/>`,
 bird:`<path d="M-32 6q18-31 43-10 17-6 28 9-12 6-25 5-15 24-39 10-13-8-7-14Z" fill="#55bde8" stroke="#173d79" stroke-width="5"/><path d="m37 2 16 8-16 7" fill="#ffc24b" stroke="#173d79" stroke-width="4"/><circle cx="23" cy="-2" r="3" fill="#173d79"/><path d="M-20 0q13-12 25 3-13 15-25-3Z" fill="#9be2f2"/>`,
 flower:`<g stroke="#173d79" stroke-width="4"><circle cy="-18" r="17" fill="#ff89b5"/><circle cx="18" r="17" fill="#ff89b5"/><circle cy="18" r="17" fill="#ff89b5"/><circle cx="-18" r="17" fill="#ff89b5"/><circle r="12" fill="#ffd14f"/></g>`,
 ball:`<circle r="31" fill="#ffcd43" stroke="#173d79" stroke-width="5"/><path d="M-25-18Q0 0 25-18M-25 18Q0 0 25 18M0-31V31" fill="none" stroke="#ef7950" stroke-width="5"/>`,
 star:`<path d="m0-33 9 22 24 2-18 16 6 25L0 19l-21 13 6-25-18-16 24-2Z" fill="#ffd447" stroke="#173d79" stroke-width="5" stroke-linejoin="round"/>`
};
const group=(kind,n,scale=n>6?.58:n>4?.68:.82)=>layouts[n].map(([x,y])=>`<g transform="translate(${x} ${y}) scale(${scale})">${icons[kind]}</g>`).join('');
for(const n of [2,3,4,6])await save(`apples-${n}`,group('apple',n));
for(const n of [4,6])await save(`birds-${n}`,group('bird',n));
for(const n of [5,8])await save(`flowers-${n}`,group('flower',n));
await save('balls-6',group('ball',6));
await save('stars-7',group('star',7));
await save('sun-1','<circle cx="120" cy="120" r="50" fill="#ffd447" stroke="#173d79" stroke-width="7"/><g stroke="#ff9f32" stroke-width="10" stroke-linecap="round">'+Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<path d="M${120+66*Math.cos(a)} ${120+66*Math.sin(a)}L${120+92*Math.cos(a)} ${120+92*Math.sin(a)}"/>`}).join('')+'</g><circle cx="103" cy="112" r="5" fill="#173d79"/><circle cx="137" cy="112" r="5" fill="#173d79"/><path d="M101 135q19 18 38 0" fill="none" stroke="#173d79" stroke-width="6" stroke-linecap="round"/>');
