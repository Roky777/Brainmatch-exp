import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { validateContentManifest } from '../shape-friends/content.js';

const manifest=JSON.parse(await readFile(new URL('../body-sound-match/game-content.json',import.meta.url),'utf8'));

test('Body & Sound Match ships nine complete, valid chapters',()=>{
  assert.equal(validateContentManifest(manifest),true);
  assert.equal(manifest.variant.id,'body-sound-match');
  assert.equal(manifest.rounds.length,9);
  assert.deepEqual(manifest.rounds.map(round=>round.pairs.length),[4,4,4,4,4,4,8,8,8]);
});

test('body vocabulary and function chapters follow the learning brief',()=>{
  assert.deepEqual(manifest.rounds[0].pairs.map(pair=>pair[0]),['body_eye','body_ear','body_nose','body_hand']);
  assert.deepEqual(manifest.rounds[2].pairs.map(pair=>pair[0]),['function_see','function_hear','function_smell','function_eat']);
  assert.deepEqual(manifest.rounds[3].pairs.map(pair=>pair[0]),['action_clap','action_walk','action_move','action_feel']);
});

test('phonics chapters cover A through Z and finish with new A-F revision pictures',()=>{
  const soundRounds=manifest.rounds.slice(4);
  const introduced=soundRounds.flatMap(round=>round.pairs.map(([category])=>category.replace('letter_','').toUpperCase()));
  assert.equal([...new Set(introduced)].join(''),'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  assert.deepEqual(manifest.rounds[8].pairs.slice(2).map(([category])=>category),['letter_a','letter_b','letter_c','letter_d','letter_e','letter_f']);
});

test('all Body & Sound Match artwork is local and picture cards contain no object labels',async()=>{
  await Promise.all(Object.values(manifest.items).map(item=>access(new URL(`../body-sound-match/assets/cards/${item.asset}`,import.meta.url))));
  const pictureAssets=[...new Set(Object.entries(manifest.items).filter(([id])=>id.startsWith('object_')||id.startsWith('picture_')).map(([,item])=>item.asset))];
  for(const asset of pictureAssets){
    const svg=await readFile(new URL(`../body-sound-match/assets/cards/${asset}`,import.meta.url),'utf8');
    assert.doesNotMatch(svg,/<text\b/i,`${asset} should be picture-only`);
  }
});

test('the Body & Sound Match XP journey totals exactly 200',()=>{
  const activities=Object.keys(manifest.worlds).length*manifest.rounds.length;
  const xp=manifest.progression.xp;
  assert.ok(xp.rewards.practice>xp.rewards.challenge);
  assert.equal(activities*(xp.rewards.practice+xp.rewards.challenge)+xp.completionBonus,200);
});
