export const BARN_ROUNDS=[
 {id:1,name:'Barn Morning',items:['cow','hen','hay','egg']},
 {id:2,name:'Pond & Petals',items:['duck','sheep','pond','flowers']}
];
export const BARN_ITEMS={cow:{name:'Cow',place:'near the barn'},hen:{name:'Hen',place:'near the fence'},hay:{name:'Hay',place:'by the barn'},egg:{name:'Egg',place:'near the nest'},duck:{name:'Duck',place:'near the pond'},sheep:{name:'Sheep',place:'on the hill'},pond:{name:'Pond',place:'at the meadow edge'},flowers:{name:'Flowers',place:'by the path'}};
export const BARN_STORAGE='brainmatch-exp:pip-barnyard:v1';
export const emptyBarnSave=()=>({discoveries:[],completed:[],voice:true,effects:true});
export function sanitizeBarnSave(raw){const s=emptyBarnSave(),valid=new Set(Object.keys(BARN_ITEMS));if(!raw||typeof raw!=='object')return s;s.discoveries=[...new Set(Array.isArray(raw.discoveries)?raw.discoveries.filter(x=>valid.has(x)):[])];s.completed=[...new Set(Array.isArray(raw.completed)?raw.completed.filter(x=>x===1||x===2):[])];s.voice=raw.voice!==false;s.effects=raw.effects!==false;return s;}
export function barnDeck(roundId,rng=Math.random){const round=BARN_ROUNDS.find(r=>r.id===roundId);if(!round)throw new RangeError('Unknown barn round');const deck=round.items.flatMap(pair=>[0,1].map(copy=>({id:pair+'-'+copy,pair})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export class SharedMemory{
 constructor(){this.seen=new Map();}
 remember(index,pair){this.seen.set(index,pair);}
 forget(pair){for(const [i,id] of this.seen)if(id===pair)this.seen.delete(i);}
 knownPair(available){const allowed=new Set(available),first=new Map();for(const [i,pair] of this.seen){if(!allowed.has(i))continue;if(first.has(pair))return[first.get(pair),i];first.set(pair,i);}return null;}
 hint(available){const pair=this.knownPair(available);if(pair)return{type:'pair',pair:this.seen.get(pair[0]),indices:pair};const one=available.find(i=>this.seen.has(i));return one===undefined?{type:'none'}:{type:'single',pair:this.seen.get(one),index:one};}
}
export function guideFirst(memory,available,rng=Math.random){const pair=memory.knownPair(available);if(pair)return pair[0];const unseen=available.filter(i=>!memory.seen.has(i)),pool=unseen.length?unseen:available;return pool[Math.floor(rng()*pool.length)];}
export function guideSecond(memory,available,first,pair,rng=Math.random){const rest=available.filter(i=>i!==first),mate=rest.find(i=>memory.seen.get(i)===pair);if(mate!==undefined)return mate;const unseen=rest.filter(i=>!memory.seen.has(i)),pool=unseen.length?unseen:rest;return pool[Math.floor(rng()*pool.length)];}
export class BarnBoard{
 constructor(roundId,rng=Math.random){this.roundId=roundId;this.deck=barnDeck(roundId,rng);this.open=[];this.matched=new Set();this.turn='child';this.phase='ready';this.memory=new SharedMemory();}
 available(){return this.deck.map((_,i)=>i).filter(i=>!this.matched.has(this.deck[i].pair));}
 reveal(i){if(this.phase!=='ready'||this.open.includes(i)||!this.available().includes(i))return null;const card=this.deck[i];this.open.push(i);this.memory.remember(i,card.pair);if(this.open.length===2)this.phase='resolving';return card;}
 resolve(){if(this.phase!=='resolving')throw Error('Two cards required');const pair=this.deck[this.open[0]].pair,match=pair===this.deck[this.open[1]].pair;if(match){this.matched.add(pair);this.memory.forget(pair);}this.open=[];this.turn=this.turn==='child'?'guide':'child';this.phase=this.matched.size===4?'complete':'ready';return{match,pair:match?pair:null,complete:this.phase==='complete'};}
}
