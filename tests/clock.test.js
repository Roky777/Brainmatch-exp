import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshSave, sanitizeSave, writeSave, loadSave, STORAGE_KEY } from '../storage.js';

test('saved discoveries and completed rounds restore without duplicates', () => {
  const clean = sanitizeSave({ discoveries: ['cow','cow','wrong','pond'], completedRounds: [1,1,9], voice: false, effects: false });
  assert.deepEqual(clean, { discoveries: ['cow','pond'], completedRounds: [1], voice: false, effects: false });
});

test('storage round trip is safe and defaults survive malformed data', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const save = freshSave(); save.discoveries.push('hen'); save.completedRounds.push(1);
  assert.equal(writeSave(save, storage), true);
  assert.ok(values.has(STORAGE_KEY));
  assert.deepEqual(loadSave(storage), save);
  values.set(STORAGE_KEY, '{broken');
  assert.deepEqual(loadSave(storage), freshSave());
});
