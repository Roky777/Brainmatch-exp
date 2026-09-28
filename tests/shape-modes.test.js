import test from 'node:test';
import assert from 'node:assert/strict';
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
test('Context reactions vary and every event has a local voice clip',()=>{
 const dialogue=new Dialogue();assert.notEqual(dialogue.next('match'),dialogue.next('match'));
 for(const lines of Object.values(LINES))for(const line of lines)assert(VOICE_CLIPS[line],line);
});
