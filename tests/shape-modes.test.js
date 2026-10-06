import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import { MatchBoard } from '../shape-friends/engine.js';
import { CompanionMemory } from '../shape-friends/companion.js';
import { LEVELS, playOptions, resultFor } from '../shape-friends/play-options.js';
import { Dialogue, LINES } from '../shape-friends/dialogue.js';
import { VOICE_CLIPS } from '../shape-friends/audio.js';
const cards = Array.from({length:8},(_,i)=>({id:String(i),pairId:String(Math.floor(i/2)),item:String(i)}));
function turn(board,a,b){board.reveal(a,board.actor);board.reveal(b,board.actor);board.resolve();board.advance();}
test('Practice gives every turn to the child and counts each pair once',()=>{
 const board=new MatchBoard(cards,{shuffled:false,mode:'practice'});
 turn(board,0,2);assert.equal(board.actor,'child');assert.deepEqual(board.scores,{child:0,sparky:0});
 for(let i=0;i<8;i+=2){turn(board,i,i+1);assert.equal(board.actor,'child');}
 assert.deepEqual(board.scores,{child:4,sparky:0});assert.equal(resultFor(board),'practice');
});
test('Challenge awards extra turns to both players and resolves all three outcomes',()=>{
 const tie=new MatchBoard(cards,{shuffled:false});assert.equal(resultFor(tie),null);
 turn(tie,0,1);assert.equal(tie.actor,'child');turn(tie,2,3);assert.equal(tie.actor,'child');
 turn(tie,4,6);assert.equal(tie.actor,'sparky');turn(tie,4,5);assert.equal(tie.actor,'sparky');turn(tie,6,7);
 assert.deepEqual(tie.scores,{child:2,sparky:2});assert.equal(resultFor(tie),'tie');
 const win=new MatchBoard(cards.slice(0,6),{shuffled:false});for(let i=0;i<6;i+=2)turn(win,i,i+1);assert.equal(resultFor(win),'win');
 const lose=new MatchBoard(cards.slice(0,6),{shuffled:false});turn(lose,0,2);for(let i=0;i<6;i+=2)turn(lose,i,i+1);assert.equal(resultFor(lose),'lose');
});
test('Sparky levels have bounded observed memory, never hidden information',()=>{
 for(const level of Object.values(LEVELS)){
   const memory=new CompanionMemory({capacity:level.capacity});
   cards.forEach((card,index)=>memory.observe({...card,index}));
   assert.equal(memory.seen.size,Math.min(8,level.capacity));
   const legal=[0,1,2,3,4,5,6,7];assert(legal.includes(memory.chooseFirst(legal)));
   memory.removePair('3');assert([...memory.seen.values()].every(c=>c.pairId!=='3'));
 }
 assert.deepEqual(playOptions('bad','bad'),{mode:'practice',level:'gentle'});
 assert.deepEqual(Object.values(LEVELS).map(l=>l.pairs),[2,3,4]);
});
test('Sparky makes kind memory mistakes instead of always taking a known pair',()=>{
 const memory=new CompanionMemory({capacity:4,accuracy:.3});
 memory.observe({index:0,pairId:'round',item:'ball'});
 memory.observe({index:1,pairId:'round',item:'orange'});
 memory.observe({index:2,pairId:'box',item:'book'});
 assert.equal(memory.chooseFirst([0,1,2],()=>.9),2,'failed recall leaves the known pair for the child');
 assert.equal(memory.chooseSecond([0,1,2],{index:0,pairId:'round'},()=>.9),2,'failed recall chooses a legal non-mate');
 assert.equal(memory.chooseSecond([0,1],{index:0,pairId:'round'},()=>.9),1,'the last legal card still completes the board');
 assert(Object.values(LEVELS).every(level=>level.accuracy<.7),'even Hard Sparky remains child-friendly');
});
test('Context reactions vary and every event has a local voice clip',()=>{
 const dialogue=new Dialogue();assert.notEqual(dialogue.next('miss'),dialogue.next('miss'));
 for(const lines of Object.values(LINES))for(const line of lines)assert(VOICE_CLIPS[line],line);
});
test('pre-readers can choose a board by card count and start with one tap',async()=>{
 const html=await readFile(new URL('../shape-friends/index.html',import.meta.url),'utf8');
 for(const [level,label,pairs,cards,image] of [['gentle','Easy',2,4,'difficulty-easy.svg'],['growing','Medium',3,6,'difficulty-medium.svg'],['clever','Hard',4,8,'difficulty-hard.svg']]){
   const button=html.match(new RegExp(`<button[^>]*data-level="${level}"[\\s\\S]*?</button>`))?.[0]||'';
   assert.match(button,new RegExp(`<strong>${label}</strong>`));
   assert.match(button,new RegExp(`${pairs} pairs · ${cards} cards`));
   assert.match(button,new RegExp(`<img[^>]+${image}`));
   assert.match(await readFile(new URL(`../shape-friends/assets/${image}`,import.meta.url),'utf8'),/^<svg/);
 }
 assert.doesNotMatch(html,/🙂|🤔|🤩/,'difficulty controls do not use platform emoji');
 assert.match(html,/id="level-dialog"/,'difficulty is a focused modal rather than a replacement page');
 assert.doesNotMatch(html,/id="level-panel"/);
 assert.doesNotMatch(html,/id="start-game"/,'level choice itself is the start action');
 const app=await readFile(new URL('../shape-friends/app.js',import.meta.url),'utf8');
 assert.match(app,/button\.dataset\.level\);\s*\$\('level-dialog'\)\.close\(\);activateAudio\(\);startRound\(save\.activeRound\)/);
});
test('pause menu stays child-facing and uses complete setting controls',async()=>{
 const html=await readFile(new URL('../shape-friends/index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../shape-friends/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(html,/For grown-ups|id="chapter-path"|id="restart-round"/);
 for(const [id,label] of [['voice-toggle','Voice'],['music-toggle','Music']]){
   const button=html.match(new RegExp(`<button id="${id}"[\\s\\S]*?</button>`))?.[0]||'';
   assert.match(button,new RegExp(`data-setting-label="${label}"`));
   assert.match(button,/class="setting-switch"/);
   assert.match(button,/class="setting-state">On</);
 }
 assert.doesNotMatch(html,/id="effects-toggle"|>Sounds</);
 assert.match(html,/class="setting-icon"[\s\S]*?<svg/,'settings use drawn icons rather than emoji');
 assert.match(html,/id="settings-home"[\s\S]*Choose a game/);
 assert.match(app,/if \(key === 'music'\) \{ save\.effects = save\.music;/,'Music is the master switch for effects too');
});
test('welcome narration finishes before the board accepts taps',async()=>{
 const app=await readFile(new URL('../shape-friends/app.js',import.meta.url),'utf8');
 assert.match(app,/mode = 'match'; busy = enteringPlay/);
 assert.match(app,/const welcomeVoice=speakLine\(sparky,openingLine\);[\s\S]*waitForVoice\(welcomeVoice,ticket\)[\s\S]*busy=false;renderBoard\(\)/);
 assert.match(app,/music\.setDucked\(true\)/);
});
test('card artwork is decoded before play and has a nonblank loading face',async()=>{
 const app=await readFile(new URL('../shape-friends/app.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../shape-friends/prototype.css',import.meta.url),'utf8');
 assert.match(app,/const artReady=Promise\.all/);
 assert.match(app,/await artReady;[\s\S]*?busy=false;renderBoard\(\)/);
 assert.match(app,/front\.classList\.add\('is-loading'\)/);
 assert.match(css,/\.card-front\.is-loading::after/);
});
