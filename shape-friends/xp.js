export const XP_LIMIT = 200;
export const XP_REWARDS = Object.freeze({ practice: 10, challenge: 6 });

export function awardXP(save, mode) {
  const before = Number.isInteger(save.xp) ? Math.max(0, Math.min(XP_LIMIT, save.xp)) : 0;
  const available = XP_LIMIT - before;
  const earned = Math.min(available, XP_REWARDS[mode] || 0);
  save.xp = before + earned;
  return { earned, total: save.xp, max: XP_LIMIT, complete: save.xp === XP_LIMIT };
}
