import { PACK, ITEMS } from './content.js';
export const SAVE_KEY = 'brainmatch:shape-friends:v1';
export const emptySave = () => ({ version: 1, discoveries: [], completed: [], voice: true, effects: true, activeRound: '1', gardenWater: 0 });
export function sanitizeSave(raw) {
  const save = emptySave();
  if (!raw || typeof raw !== 'object') return save;
  const validRounds = PACK.rounds.map(round => round.id);
  save.discoveries = [...new Set(Array.isArray(raw.discoveries) ? raw.discoveries.filter(item => Object.hasOwn(ITEMS, item)) : [])];
  // Completed rounds must have their expected discoveries. Corruption cannot unlock content.
  save.completed = validRounds.filter(id => Array.isArray(raw.completed) && raw.completed.includes(id) && PACK.rounds.find(round => round.id === id).pairs.every(([, a, b]) => save.discoveries.includes(a) && save.discoveries.includes(b)));
  save.voice = raw.voice !== false; save.effects = raw.effects !== false;
  save.activeRound = validRounds.includes(raw.activeRound) ? raw.activeRound : '1';
  save.gardenWater = Number.isInteger(raw.gardenWater) ? Math.max(0, Math.min(3, raw.gardenWater)) : 0;
  return save;
}
export function readSave(storage) {
  try { return sanitizeSave(JSON.parse((storage || globalThis.localStorage).getItem(SAVE_KEY))); } catch { return emptySave(); }
}
export function writeSave(save, storage) {
  try { (storage || globalThis.localStorage).setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; }
}
export function discover(save, items) {
  const added = items.filter(item => !save.discoveries.includes(item));
  save.discoveries = [...new Set([...save.discoveries, ...items])];
  return added;
}
