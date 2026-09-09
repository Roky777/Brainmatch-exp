import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CUES,VOICE_CLIPS} from '../narration.js';
import {HindiVoice} from '../voice.js';
function fixture(options={}){
 const spoken=[],clips=[];
 const engine={getVoices:()=>[{name:'Hindi',lang:'hi-IN'}],addEventListener(){},cancel(){},speak:u=>spoken.push(u)};
 const voice=new HindiVoice({engine,isHidden:()=>false,createUtterance:text=>({text}),createAudio:src=>{const a={src,play:()=>Promise.resolve(),pause(){this.paused=true;}};clips.push(a);return a;},...options});
 return {voice,spoken,clips};
}
test('all gameplay captions are English, with separate Hindi speech',()=>{
 for(const cue of Object.values(CUES)){assert.doesNotMatch(cue.text,/[\u0900-\u097f]/);assert.match(cue.spoken,/[\u0900-\u097f]/);}
});
test('static screens declare English and have no Hindi text',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(html,/[\u0900-\u097f]/);assert.doesNotMatch(html,/lang="hi"/);
});
test('device fallback speaks Hindi, not the English caption',()=>{
 const {voice,spoken}=fixture();voice.say(CUES.matched.spoken);
 assert.equal(spoken[0].text,CUES.matched.spoken);assert.equal(spoken[0].lang,'hi-IN');assert.equal(spoken[0].pitch,1);
});
test('reviewed clips take precedence without pitch or speed alteration',async()=>{
 const line=CUES.matched.spoken,{voice,spoken,clips}=fixture({clips:{[line]:'./test.mp3'}});
 voice.say(line);await Promise.resolve();assert.equal(clips.length,1);assert.equal(clips[0].playbackRate,1);assert.equal(spoken.length,0);
 voice.setEnabled(false);assert.equal(clips[0].paused,true);voice.replay();assert.equal(clips.length,1);
});
test('an unavailable clip falls back to device speech',async()=>{
 const line=CUES.matched.spoken,{voice,spoken}=fixture({clips:{[line]:'./test.mp3'},createAudio:()=>({pause(){},play:()=>Promise.reject(Error('Unavailable'))})});
 voice.say(line);await Promise.resolve();assert.equal(spoken.length,1);
});
test('stopped audio cannot trigger stale fallback narration',async()=>{
 let reject;const line=CUES.matched.spoken,{voice,spoken}=fixture({clips:{[line]:'./test.mp3'},createAudio:()=>({pause(){},play:()=>new Promise((_,r)=>reject=r)})});
 voice.say(line);voice.stop();reject(Error('Interrupted'));await Promise.resolve();assert.equal(spoken.length,0);
});
test('missing Hindi voice remains silent; no bogus asset URLs ship',()=>{
 const {voice,spoken}=fixture({engine:undefined});assert.doesNotThrow(()=>voice.say(CUES.find.spoken));assert.equal(spoken.length,0);assert.deepEqual(VOICE_CLIPS,{});
});
