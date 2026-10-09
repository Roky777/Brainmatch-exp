import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { validateContentManifest } from '../shape-friends/content.js';

const manifest=JSON.parse(await readFile(new URL('../number-friends/game-content.json',import.meta.url),'utf8'));

test('Number Friends ships seven complete, valid learning levels',()=>{
  assert.equal(validateContentManifest(manifest),true);
  assert.equal(manifest.variant.id,'number-friends');
  assert.equal(manifest.rounds.length,7);
  assert.deepEqual(manifest.rounds.map(round=>round.pairs.length),[4,4,4,4,8,4,4]);
});

test('every Number Friends pair represents one equal quantity',()=>{
  for(const round of manifest.rounds){
    for(const [category,a,b] of round.pairs){
      const expected=Number(category.replace('number_',''));
      const quantity=id=>Number(id.match(/_(\d+)$/)?.[1]);
      assert.equal(quantity(a),expected,`${round.id}: ${a}`);
      assert.equal(quantity(b),expected,`${round.id}: ${b}`);
      assert.notEqual(a,b);
    }
  }
});

test('all numeral, dot, hand and object artwork is local and present',async()=>{
  await Promise.all(Object.values(manifest.items).map(item=>access(new URL(`../number-friends/assets/cards/${item.asset}`,import.meta.url))));
});

test('the longer Number Friends XP journey still totals exactly 200',()=>{
  const activities=Object.keys(manifest.worlds).length*manifest.rounds.length;
  const xp=manifest.progression.xp;
  assert.ok(xp.rewards.practice>xp.rewards.challenge);
  assert.equal(activities*(xp.rewards.practice+xp.rewards.challenge)+xp.completionBonus,200);
});
