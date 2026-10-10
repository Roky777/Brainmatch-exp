import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('game-content.json',base),'utf8'));
await mkdir(new URL('assets/cards/',base),{recursive:true});
const ink='#203975';
const coin=(value,x,y,r)=>`<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#metal${value===5?'Gold':'Silver'})" stroke="${ink}" stroke-width="3"/><circle r="${r-5}" fill="none" stroke="${value===5?'#bd842a':'#8d9bad'}" stroke-width="2" stroke-dasharray="2 3"/>${value===10?`<circle r="${r*.69}" fill="url(#metalGold)" stroke="#bf8f3e" stroke-width="1.5"/>`:''}<path d="M${-r*.7} ${-r*.45} Q0 ${-r*.95} ${r*.7} ${-r*.45}" fill="none" stroke="#fff" stroke-width="3" opacity=".65"/><text text-anchor="middle" y="${r*.14}" fill="${ink}" font-family="Arial,sans-serif" font-weight="900" font-size="${r*.75}">₹${value}</text><text text-anchor="middle" y="${r*.53}" fill="${ink}" font-family="Arial,sans-serif" font-size="${r*.19}" font-weight="700">INDIA</text></g>`;
const colors={10:['#b37643','#f7e0bb'],20:['#819649','#eef2c1'],50:['#3993aa','#d0f3ef'],100:['#8765ab','#e8d9f5']};
const note=(value,y=120,w=220)=>{
  const [dark,pale]=colors[value],h=w*.48,x=120-w/2;
  return `<g transform="translate(${x} ${y-h/2})"><rect width="${w}" height="${h}" rx="9" fill="${pale}" stroke="${ink}" stroke-width="3"/><rect x="7" y="7" width="${w-14}" height="${h-14}" rx="5" fill="none" stroke="${dark}" stroke-width="2"/><path d="M${w*.59} 9v${h-18}" stroke="${dark}" stroke-width="7" opacity=".35"/><circle cx="${w*.76}" cy="${h*.51}" r="${h*.27}" fill="none" stroke="${dark}" stroke-width="2"/><path d="M${w*.68} ${h*.51}q${w*.08} ${-h*.42} ${w*.16} 0q${-w*.08} ${h*.42} ${-w*.16} 0" fill="none" stroke="${dark}"/><text x="15" y="${h*.23}" fill="${dark}" font-family="Arial,sans-serif" font-size="${w*.06}" font-weight="700">INDIA</text><text x="15" y="${h*.67}" fill="${ink}" font-family="Arial,sans-serif" font-size="${w*.19}" font-weight="900">₹${value}</text><text x="${w/2}" y="${h-10}" text-anchor="middle" fill="${dark}" font-family="Arial,sans-serif" font-size="${w*.037}" letter-spacing="1">LEARNING NOTE</text></g>`;
};
for(const item of Object.values(manifest.items)){
  let art='';
  if(item.note){art=note(item.note,item.coins?77:120);if(item.coins)art+=coin(1,120,184,36);}
  else if(item.coins){
    const positions={1:[[120,120,79]],2:[[66,86,47],[174,153,47]],3:[[120,60,43],[66,168,43],[174,168,43]],4:[[63,63,44],[177,63,44],[63,177,44],[177,177,44]]}[item.coins.length];
    art=item.coins.map((v,i)=>coin(v,...positions[i])).join('');
  }else art=`<text x="120" y="143" text-anchor="middle" fill="${ink}" font-family="Arial,sans-serif" font-size="${item.value>=100?65:86}" font-weight="900">₹${item.value}</text>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="metalSilver" x2=".8" y2="1"><stop stop-color="#fbfdff"/><stop offset=".45" stop-color="#cdd6de"/><stop offset="1" stop-color="#9faebf"/></linearGradient><linearGradient id="metalGold" x2=".8" y2="1"><stop stop-color="#fff0ac"/><stop offset=".4" stop-color="#e3b951"/><stop offset="1" stop-color="#b68631"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="${ink}" flood-opacity=".2"/></filter></defs><g filter="url(#shadow)">${art}</g></svg>`;
  await writeFile(new URL(`assets/cards/${item.asset}`,base),svg);
}
console.log(`Generated ${Object.keys(manifest.items).length} labelled currency assets.`);
