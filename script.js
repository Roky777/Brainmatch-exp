import {LEVELS,MAX_XP,STORAGE_KEY,emptySave,sanitize,totalXP,unlocked,record,shuffledDeck} from './game-data.js';
import {icon,cardArt,pip,world} from './art.js';
import {TurnClock} from './clock.js';
import {HindiVoice} from './voice.js?v=english-ui2';
import {CUES} from './narration.js';

const $=id=>document.getElementById(id),clock=new TurnClock(),voice=new HindiVoice();
let save=emptySave(),board=null,view='home',selected=[],busy=false,preview=false,intro=0,lastLevel=0,afterLesson=null,lessonStep=0,audio;
try{save=sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{}
voice.setEnabled(save.sound);
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(save));}catch{$('save-notice').hidden=false;}}
function saveBoard(){if(board&&board.matched.length<LEVELS[board.level].pairs.length){save.active=structuredClone(board);persist();}}
function sound(kind='tap'){
 if(!save.sound)return;
 try{audio??=new AudioContext();audio.resume();const notes=kind==='win'?[523,659,784,1047]:kind==='match'?[659,880]:[440];notes.forEach((n,i)=>{const t=audio.currentTime+i*.10,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=n;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.065,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.24);o.onended=()=>{o.disconnect();g.disconnect();};});}catch{}
}
function setIcon(id,name){$(id).innerHTML=icon(name);}
$('world').innerHTML=world();
$('home-pip').innerHTML=pip();$('friend-left').innerHTML=icon('flower');$('friend-right').innerHTML=icon('frog');$('coach').innerHTML=pip();$('finish-pip').innerHTML=pip();
for(const [id,name] of Object.entries({play:'play',garden:'flower',settings:'settings','map-home':'home',back:'home','turn-icon':'replay',ready:'next',peek:'eye',retry:'replay',next:'next','finish-map':'flower'}))setIcon(id,name);
function soundButton(){setIcon('sound',save.sound?'sound':'mute');$('sound').setAttribute('aria-label',save.sound?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(save.sound));}
soundButton();
function show(id){voice.stop();document.querySelectorAll('.screen').forEach(s=>s.hidden=s.id!==id);view=id;document.body.dataset.screen=id;window.scrollTo(0,0);const h=$(id).querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
function leave(){saveBoard();clock.cancel();board=null;selected=[];busy=false;preview=false;}
function home(){leave();show('home');$('play').setAttribute('aria-label',save.active?'Continue playing':'Play');}
function map(){leave();show('map');$('level-path').innerHTML=LEVELS.map((l,i)=>{const r=save.results[i],locked=i>unlocked(save);return '<button class="island '+(locked?'locked':'')+'" data-level="'+i+'" '+(locked?'disabled':'')+' aria-label="Level '+(i+1)+': '+l.name+(locked?', locked':r?', '+r.stars+' stars':'')+'" style="--island:'+l.color+'"><span class="island-number">'+(i+1)+'</span>'+icon(locked?'lock':l.icon)+'<span class="island-stars" aria-hidden="true">'+(r?'★'.repeat(r.stars):'')+'</span></button>';}).join('');}
function caption(key,spoken){const cue=CUES[key];$('hint').textContent=cue.text;voice.say(spoken??cue.spoken);}
function cardInfo(index){const n=board.deck[index],p=LEVELS[board.level].pairs[Math.floor(n/2)];return {pair:p,card:p.cards[n%2]};}
function drawCards(){
 const l=LEVELS[board.level];$('cards').dataset.pairs=l.pairs.length;
 $('cards').innerHTML=board.deck.map((_,i)=>'<button class="memory-card" data-card="'+i+'" aria-label="Card '+(i+1)+', face down"><span class="card-inner"><span class="card-face card-back">'+icon('leaf')+'<i></i></span><span class="card-face card-front" style="--paper:'+l.color+'">'+cardArt(cardInfo(i).card)+'</span></span><span class="match-tick">'+icon('check')+'</span><span class="tap-hand">'+icon('hand')+'</span></button>').join('');
 update();
}
function update(){
 const l=LEVELS[board.level];$('turns').textContent=board.turns;
 $('pair-progress').innerHTML=l.pairs.map(p=>'<i class="'+(board.matched.includes(p.id)?'filled':'')+'"></i>').join('');
 $('pair-progress').setAttribute('aria-label',board.matched.length+' of '+l.pairs.length+' pairs matched');
 $('cards').querySelectorAll('[data-card]').forEach((el,i)=>{const info=cardInfo(i),matched=board.matched.includes(info.pair.id),open=preview||matched||selected.includes(i);el.classList.toggle('flipped',open);el.classList.toggle('matched',matched);el.classList.toggle('guided',!preview&&board.mistakes>=2&&selected.length===1&&!selected.includes(i)&&cardInfo(selected[0]).pair.id===info.pair.id);el.disabled=matched||preview;el.setAttribute('aria-label','Card '+(i+1)+', '+(open?info.card.label:'face down')+(matched?', matched':''));});
 $('peek').disabled=board.peekUsed||busy||preview;$('peek').hidden=!board.ready;$('ready').hidden=board.ready;
}
function begin(index,fresh=false){
 if(index>unlocked(save))return;
 if(!save.tutorialDone){afterLesson=()=>begin(index,fresh);tutorial(0);return;}
 leave();lastLevel=index;
 board=!fresh&&save.active?.level===index?structuredClone(save.active):{level:index,deck:shuffledDeck(LEVELS[index]),matched:[],turns:0,ready:false,peekUsed:false,mistakes:0};
 selected=[];busy=false;intro=0;preview=!board.ready;show('playfield');
 $('level-label').textContent=String(index+1).padStart(2,'0');$('level-label').setAttribute('aria-label','Level '+(index+1)+': '+LEVELS[index].name);
 $('playfield').style.setProperty('--level-color',LEVELS[index].color);drawCards();
 if(!board.ready)introduce();else{$('pair-intro').hidden=true;$('cards').hidden=false;caption('find',LEVELS[index].hindi);}
 saveBoard();
}
const relationHindi={key:'चाबी से ताला खुलता है।',watering:'पानी से फूल खिलता है।',brush:'ब्रश से रंग लगाते हैं।',rain:'बारिश में छाता लेते हैं।',bee:'मधुमक्खी शहद बनाती है।',seed:'बीज से पेड़ उगता है।'};
function introduce(){
 const l=LEVELS[board.level];
 if(intro>=l.pairs.length){$('pair-intro').hidden=true;$('cards').hidden=false;caption('remember');update();return;}
 const p=l.pairs[intro];$('cards').hidden=true;$('pair-intro').hidden=false;
 $('pair-intro').innerHTML='<div class="intro-pair"><span class="intro-card" style="--paper:'+l.color+'">'+cardArt(p.cards[0])+'</span><span class="pair-link">'+icon('heart')+'</span><span class="intro-card" style="--paper:'+l.color+'">'+cardArt(p.cards[1])+'</span></div><div class="intro-dots" aria-label="Pair '+(intro+1)+' of '+l.pairs.length+'">'+l.pairs.map((_,i)=>'<i class="'+(i===intro?'active':'')+'"></i>').join('')+'</div>';
 caption('friends',relationHindi[p.id]||l.hindi);$('ready').hidden=false;$('peek').hidden=true;
}
function ready(){if(!board||board.ready)return;if(intro<LEVELS[board.level].pairs.length){intro++;introduce();return;}preview=false;board.ready=true;update();caption('yourTurn');$('cards').querySelector('button:not(:disabled)')?.focus({preventScroll:true});saveBoard();}
function peek(){if(!board||busy||preview||board.peekUsed)return;board.peekUsed=true;selected=[];preview=true;update();caption('peek');clock.schedule(()=>{preview=false;update();caption('again');saveBoard();},2300);}
function flip(i){
 if(!board||busy||preview||$('dialog').open||!board.ready||selected.includes(i)||board.matched.includes(cardInfo(i).pair.id))return;
 sound();selected.push(i);update();if(selected.length<2){if(board.mistakes>=2)caption('hint');return;}
 board.turns++;const [a,b]=selected;
 if(cardInfo(a).pair.id===cardInfo(b).pair.id){
 board.matched.push(cardInfo(a).pair.id);board.mistakes=0;selected=[];sound('match');update();caption('matched');burst(8);
 if(board.matched.length===LEVELS[board.level].pairs.length){busy=true;const index=board.level,result=record(save,index,board.turns);persist();clock.schedule(()=>resultScreen(index,result),700);}
 else saveBoard();
 }else{
 busy=true;board.mistakes++;update();caption('tryAgain');saveBoard();
 clock.schedule(()=>{selected=[];busy=false;update();caption(board.mistakes>=2?'help':'find');},1400);
 }
}
function tutorial(step){
 leave();show('lesson');lessonStep=step;
 const labels=['Look!','Tap here!','Find its friend!','You did it!'];
 const speech=['नमस्ते! मैं पिप हूँ। चलो जोड़ी बनाना सीखें। ये दो सितारे दोस्त हैं।','पहला चमकता कार्ड छुओ।','अब दूसरा चमकता कार्ड छुओ। दोनों सितारे हैं!','वाह! जोड़ी मिल गई। अब खेलते हैं!'];
 $('lesson').innerHTML='<div class="tutorial-coach">'+pip()+'<h1 lang="en">'+labels[step]+'</h1></div><div class="tutorial-grid">'+['star','heart','star','heart'].map((id,i)=>{const open=step===0||(step>=2&&i===0)||(step===3&&i===2),target=(step===1&&i===0)||(step===2&&i===2);return '<button class="memory-card '+(open?'flipped ':'')+(target?'guided':'')+'" data-tutorial="'+i+'" '+(!target?'disabled':'')+' aria-label="'+(target?'Tap the glowing card':open?id:'Hidden card')+'"><span class="card-inner"><span class="card-face card-back">'+icon('leaf')+'</span><span class="card-face card-front" style="--paper:#f9d17b">'+icon(id,'picture')+'</span></span><span class="tap-hand">'+icon('hand')+'</span></button>';}).join('')+'</div><div class="tutorial-actions"><button class="round" data-repeat aria-label="Repeat Hindi instruction">'+icon('sound')+'</button>'+([0,3].includes(step)?'<button class="big-button" data-tutorial-next aria-label="'+(step===0?'Start practice':'Start the game')+'">'+icon('play')+'</button>':'')+'</div>';
 voice.say(speech[step]);const target=$('lesson').querySelector('.guided,[data-tutorial-next]');target?.focus({preventScroll:true});
}
function resultScreen(index,r){
 clock.cancel();board=null;busy=false;lastLevel=index;show('result');sound('win');
 $('result-title').textContent=r.stars===3?'Amazing!':'Well done!';
 $('stars').innerHTML=[1,2,3].map(n=>'<span class="'+(n<=r.stars?'earned':'')+'">'+icon('star')+'</span>').join('');
 $('stars').setAttribute('aria-label',r.stars+(r.stars===1?' star':' stars'));
 $('reward-art').innerHTML=icon(LEVELS[index].icon);
 $('score').textContent=r.xp+' / '+LEVELS[index].xp+' XP';
 $('result-turns').textContent=r.turns+' turns';
 $('score-details').textContent='Level '+(index+1)+': '+LEVELS[index].name+'. '+LEVELS[index].pairs.length+' turns = 3 stars and '+LEVELS[index].xp+' XP; up to '+(LEVELS[index].pairs.length+2)+' turns = 2 stars and '+Math.round(LEVELS[index].xp*.8)+' XP; more = 1 star and '+Math.round(LEVELS[index].xp*.6)+' XP. Garden total (best results): '+totalXP(save)+' / 200 XP. Added this time: '+r.added+' XP.';
 $('next').setAttribute('aria-label',index===LEVELS.length-1?'See your garden':'Next level');
 voice.say('शाबाश! एक नया दोस्त तुम्हारे बगीचे में आ गया।');burst(30);
}
function finish(){
 leave();show('finish');$('collected').innerHTML=LEVELS.map((l,i)=>'<span class="collected-friend" style="--delay:'+i*.1+'s">'+icon(l.icon)+'</span>').join('');
 $('total-score').textContent=totalXP(save)+' / '+MAX_XP+' XP';voice.say('वाह! तुम्हारा बगीचा कितना प्यारा है!');sound('win');burst(36);
}
function burst(count){$('particles').innerHTML=Array.from({length:count},(_,i)=>'<i style="--x:'+Math.random()*100+'%;--r:'+Math.random()*600+'deg;--d:'+Math.random()*.4+'s;--c:'+['#ed96a9','#ffdb78','#91cbb1','#a9a0d6'][i%4]+'"></i>').join('');}
function pause(){
 if($('dialog').open)return;clock.pause();voice.stop();
 $('dialog-body').innerHTML='<h2 lang="en">Take a break?</h2><div class="pause-actions"><button class="big-button" data-action="resume" aria-label="Resume">'+icon('play')+'</button><button class="round" data-action="home" aria-label="Save and go home">'+icon('home')+'</button></div><details><summary>For grown-ups</summary><p>Flip two cards to find a pair. One pair attempt is one turn. Perfect play earns 100% XP, up to two extra turns earns 80%, and more earns 60%. Six levels share 200 XP; replaying saves only your best score.</p><p>Hindi narration can play reviewed voice recordings. Until those are supplied, it uses your device’s Hindi voice. If no Hindi voice is installed, visual guidance still works. No account, ads, tracking or purchases.</p><p>Keyboard: Tab, Enter / Space; Escape pauses. Progress stays on this browser.</p><button data-action="tutorial" class="text-button">Replay guided lesson</button><button data-action="reset" class="text-button">Reset progress…</button></details>';
 $('dialog').showModal();
}
function closeDialog(){ $('dialog').close(); }
$('dialog').addEventListener('close',()=>{if($('dialog').open)return;if(view==='playfield'&&board)clock.resume();});
$('dialog').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
$('dialog').addEventListener('click',e=>{
 const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
 if(action==='resume')closeDialog();
 if(action==='home'){leave();closeDialog();home();}
 if(action==='tutorial'){leave();closeDialog();afterLesson=()=>home();tutorial(0);}
 if(action==='reset'){$('dialog-body').innerHTML='<h2>Reset this garden?</h2><p>This removes saved results in this experimental game only.</p><button class="big-button" data-action="resume">Keep it</button><button class="text-button" data-action="confirm-reset">Reset progress</button>';}
 if(action==='confirm-reset'){leave();save=emptySave();persist();voice.setEnabled(true);soundButton();closeDialog();home();}
});
$('sound').onclick=()=>{save.sound=!save.sound;voice.setEnabled(save.sound);soundButton();persist();if(save.sound)voice.replay();};
$('settings').onclick=pause;$('play').onclick=()=>{sound();begin(save.active?.level??unlocked(save));};$('garden').onclick=map;$('map-home').onclick=home;$('back').onclick=map;
$('level-path').onclick=e=>{const target=e.target.closest('[data-level]');if(target&&!target.disabled)begin(Number(target.dataset.level));};
$('cards').onclick=e=>{const target=e.target.closest('[data-card]');if(target)flip(Number(target.dataset.card));};
$('lesson').onclick=e=>{
 if(e.target.closest('[data-repeat]'))voice.replay();
 if(e.target.closest('[data-tutorial-next]')){sound();if(lessonStep===0)tutorial(1);else if(lessonStep===3){save.tutorialDone=true;persist();const cb=afterLesson;afterLesson=null;cb?.();}}
 if(e.target.closest('[data-tutorial]:not(:disabled)')){sound(lessonStep===2?'match':'tap');tutorial(lessonStep+1);}
};
$('ready').onclick=ready;$('peek').onclick=peek;$('coach').onclick=()=>voice.replay();
$('retry').onclick=()=>begin(lastLevel,true);$('next').onclick=()=>lastLevel===LEVELS.length-1?finish():begin(lastLevel+1);$('finish-map').onclick=map;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('dialog').open){e.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){saveBoard();voice.stop();if(view==='playfield'||view==='lesson')pause();}});
window.addEventListener('pagehide',()=>{saveBoard();clock.cancel();voice.stop();});
home();
