import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GuideMemory, chooseFirst, chooseSecond } from '../guide-ai.js';

test('guide uses a known pair immediately and forgets matched cards', () => {
  const memory = new GuideMemory([[0,'cow'],[3,'hen'],[6,'cow']]);
  assert.deepEqual(memory.knownPair([0,1,2,3,4,5,6,7]), [0,6]);
  assert.equal(chooseFirst(memory, [0,1,2,3,4,5,6,7]), 0);
  assert.equal(chooseSecond(memory, [0,1,2,3,4,5,6,7], 0, 'cow'), 6);
  memory.forgetMatched('cow');
  assert.equal(memory.seen.has(0), false);
  assert.equal(memory.seen.has(6), false);
});

test('guide explores unseen cards when it knows no pair', () => {
  const memory = new GuideMemory([[0,'cow'],[2,'hen']]);
  assert.equal(chooseFirst(memory, [0,1,2,3], () => 0), 1);
  memory.remember(1, 'hay');
  assert.equal(chooseSecond(memory, [0,1,2,3], 1, 'hay', () => 0), 3);
});

test('hints never invent hidden information', () => {
  const memory = new GuideMemory();
  assert.deepEqual(memory.hint([0,1,2]), { type: 'none' });
  memory.remember(2, 'egg');
  assert.deepEqual(memory.hint([0,1,2]), { type: 'single', pairId: 'egg', index: 2 });
  memory.remember(0, 'egg');
  assert.deepEqual(memory.hint([0,1,2]), { type: 'pair', pairId: 'egg', indices: [2,0] });
});
