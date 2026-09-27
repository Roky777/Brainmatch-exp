import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SPARKY_CLIPS,spriteFrame} from '../shape-friends/sparky.js';

test('Sparky plays drawn blink, pointing and celebration atlas frames',()=>{
  assert.deepEqual(spriteFrame('idle',0),{sheet:'wave',frame:0});
  assert.deepEqual(spriteFrame('idle',3150),{sheet:'wave',frame:1});
  assert.deepEqual(spriteFrame('thinking',500),{sheet:'think',frame:1});
  assert.deepEqual(spriteFrame('present-right',500),{sheet:'think',frame:3});
  assert.deepEqual(spriteFrame('happy',300),{sheet:'cheer',frame:1});
  assert.deepEqual(spriteFrame('happy',600),{sheet:'cheer',frame:2});
  for(const pose of Object.keys(SPARKY_CLIPS)){
    const frames=new Set(Array.from({length:100},(_,i)=>spriteFrame(pose,i*70).frame));
    assert(frames.size>=2,`${pose} must draw more than a static cutout`);
    assert.deepEqual(spriteFrame(pose,0,true),spriteFrame(pose,99999,true));
  }
});
test('All Sparky atlases have four transparent, bottom-aligned frames',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../shape-friends/assets/animation/atlas.json',import.meta.url)));
  for(const entry of Object.values(manifest)){
    assert.equal(entry.frames,4);assert.equal(entry.frameSize,384);
    assert(entry.bounds.every(bounds=>bounds[3]===384&&bounds[0]>0&&bounds[2]<384));
    const bytes=await readFile(new URL(`../shape-friends/assets/animation/${entry.file}`,import.meta.url));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(bytes.length>1000);
  }
});
