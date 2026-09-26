const pic=(art,label)=>({art,label});
const same=(id,label)=>({id,cards:[pic(id,label),pic(id,label)]});
const link=(id,a,b)=>({id,cards:[a,b]});
export const LEVELS=[
 {name:'Shape Meadow',hindi:'एक जैसी आकृतियाँ ढूँढो।',icon:'star',xp:15,color:'#f9c966',pairs:[same('star','Star'),same('heart','Heart')]},
 {name:'Counting Pond',hindi:'बिंदु गिनो। वही नंबर ढूँढो।',icon:'frog',xp:20,color:'#a1dce5',pairs:[1,2,3].map(n=>link('number'+n,{dots:n,label:n+' dots'},{text:String(n),label:String(n)}))},
 {name:'Little Growers',hindi:'एक जैसे पौधे ढूँढो।',icon:'flower',xp:30,color:'#f5abbb',pairs:[same('flower','Flower'),same('leaf','Leaf'),same('berry','Strawberry'),same('mushroom','Mushroom')]},
 {name:'Weather Woods',hindi:'एक जैसे मौसम की तस्वीरें मिलाओ।',icon:'sun',xp:35,color:'#f9d17b',pairs:[same('sun','Sun'),same('rain','Rain'),same('moon','Moon'),same('snow','Snow')]},
 {name:'Rupee Market',hindi:'सिक्के का नंबर देखो। वही नंबर ढूँढो।',icon:'coin',xp:45,color:'#c8b8ef',pairs:[1,2,5,10,20].map(n=>link('rupee'+n,{coin:n,label:n+' rupee coin'},{text:'₹'+n,label:n+' rupees'}))},
 {name:'Wonder Workshop',hindi:'कौन किसके काम आता है? देखो और मिलाओ।',icon:'kite',xp:55,color:'#9cdbbe',pairs:[link('key',pic('key','Key'),pic('lock','Lock')),link('watering',pic('watering','Watering can'),pic('flower','Flower')),link('brush',pic('brush','Paintbrush'),pic('paint','Paint')),link('rain',pic('rain','Rain'),pic('umbrella','Umbrella')),link('bee',pic('bee','Bee'),pic('honey','Honey')),link('seed',pic('seed','Seed'),pic('tree','Tree'))]}
];
export const MAX_XP=200, STORAGE_KEY='brainmatch-exp:pip-storybook:v1';
export function score(level,turns){const n=level.pairs.length;if(!Number.isSafeInteger(turns)||turns<n)throw new RangeError('Invalid turns');const stars=turns===n?3:turns<=n+2?2:1;return {turns,stars,xp:Math.round(level.xp*([0,.6,.8,1][stars]))};}
export const emptySave=()=>({sound:true,tutorialDone:false,results:{},active:null});
export const totalXP=save=>Object.values(save.results).reduce((n,r)=>n+r.xp,0);
export const unlocked=save=>{const i=LEVELS.findIndex((_,i)=>!save.results[i]);return i<0?LEVELS.length-1:i;};
export function shuffledDeck(level,rng=Math.random){const deck=Array.from({length:level.pairs.length*2},(_,i)=>i);for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export function record(save,index,turns){const result=score(LEVELS[index],turns),old=save.results[index];if(!old||turns<old.turns)save.results[index]=result;save.active=null;return {...result,added:Math.max(0,result.xp-(old?.xp||0))};}
export function sanitize(raw){const save=emptySave();if(!raw||typeof raw!=='object')return save;save.sound=raw.sound!==false;save.tutorialDone=raw.tutorialDone===true;for(let i=0;i<LEVELS.length;i++){try{save.results[i]=score(LEVELS[i],raw.results[i].turns);}catch{break;}}const a=raw.active,l=LEVELS[a?.level];if(save.tutorialDone&&l&&a.level<=unlocked(save)&&Array.isArray(a.deck)&&a.deck.length===l.pairs.length*2&&new Set(a.deck).size===a.deck.length&&a.deck.every(n=>Number.isInteger(n)&&n>=0&&n<a.deck.length)&&Array.isArray(a.matched)&&new Set(a.matched).size===a.matched.length&&a.matched.every(id=>l.pairs.some(p=>p.id===id))&&a.matched.length<l.pairs.length&&Number.isSafeInteger(a.turns)&&a.turns>=a.matched.length){save.active={level:a.level,deck:a.deck,matched:a.matched,turns:a.turns,ready:a.ready===true,peekUsed:a.peekUsed===true,mistakes:0};}return save;}
