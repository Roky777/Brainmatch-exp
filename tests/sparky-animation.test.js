import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SPARKY_CLIPS,spriteFrame} from '../shape-friends/sparky.js';

test('Sparky plays the supplied kimono peeking, pointing and celebration frames',()=>{
  assert.deepEqual(spriteFrame('idle',0),{sheet:'peek',frame:11});
  assert.deepEqual(spriteFrame('idle',2450),{sheet:'peek',frame:10});
  assert.deepEqual(spriteFrame('thinking',500),{sheet:'expressions',frame:1+8});
  assert.deepEqual(spriteFrame('present-right',500),{sheet:'reach',frame:3});
  assert.deepEqual(spriteFrame('happy',300),{sheet:'reactions',frame:1});
  assert.deepEqual(spriteFrame('happy',600),{sheet:'reactions',frame:3});
  for(const pose of Object.keys(SPARKY_CLIPS)){
    const frames=new Set(Array.from({length:100},(_,i)=>spriteFrame(pose,i*70).frame));
    assert(frames.size>=2,`${pose} must draw more than a static cutout`);
    assert.deepEqual(spriteFrame(pose,0,true),spriteFrame(pose,99999,true));
  }
});
test('All supplied kimono animation sheets are packaged as WebP',async()=>{
  for(const sheet of ['peek','expressions','reach','reactions']){
    const bytes=await readFile(new URL(`../shape-friends/assets/sparky/kimono-${sheet}-v1.webp`,import.meta.url));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(bytes.length>1000);
  }
});
