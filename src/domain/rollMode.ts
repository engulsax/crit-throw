/** Portfolio demo: every roll choreographs to natural 20. */
export type RollMode = "hero" | "random";

export const PUBLIC_ROLL_MODE: RollMode = "hero";

/** Flip to `true` locally to exercise fair physics (never exposed in UI). */
export const DEV_RANDOM_ROLL = import.meta.env.DEV && false;

export function activeRollMode(): RollMode {
  return DEV_RANDOM_ROLL ? "random" : PUBLIC_ROLL_MODE;
}
