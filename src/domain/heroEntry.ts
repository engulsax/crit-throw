/** Public demo: one auto crit on load, then at most one manual replay. */
export const HERO_AUTO_START_MS = 650;

export function showReplayControl(completedHeroRolls: number): boolean {
  return completedHeroRolls === 1;
}

export function canTriggerHeroRoll(
  completedHeroRolls: number,
  rolling: boolean
): boolean {
  if (rolling) return false;
  if (completedHeroRolls === 0) return true;
  return completedHeroRolls === 1;
}
