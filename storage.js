export const STORAGE_KEY = 'little-lantern-barn:v1';
export const freshSave = () => ({ discoveries: [], completedRounds: [], voice: true, effects: true });

export function sanitizeSave(raw) {
  const clean = freshSave();
  if (!raw || typeof raw !== 'object') return clean;
  const validItems = new Set(['cow', 'hen', 'hay', 'egg', 'duck', 'sheep', 'pond', 'flowers']);
  clean.discoveries = [...new Set(Array.isArray(raw.discoveries) ? raw.discoveries.filter(id => validItems.has(id)) : [])];
  clean.completedRounds = [...new Set(Array.isArray(raw.completedRounds) ? raw.completedRounds.filter(id => id === 1 || id === 2) : [])];
  clean.voice = raw.voice !== false;
  clean.effects = raw.effects !== false;
  return clean;
}

export function loadSave(storage = globalThis.localStorage) {
  try { return sanitizeSave(JSON.parse(storage.getItem(STORAGE_KEY))); } catch { return freshSave(); }
}

export function writeSave(save, storage = globalThis.localStorage) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeSave(save))); return true; } catch { return false; }
}
