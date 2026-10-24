/** Natural-20 impact beat: one shared clock drives sparks, flash, and camera. */
export const CRIT_BEAT_MS = 1600;

const FLASH_ATTACK_MS = 60;
const FLASH_DECAY_MS = 640;
const SHAKE_MS = 420;
const PUSH_IN_MS = 220;
const PUSH_HOLD_MS = 520;
const BURST_MS = 1150;

export type CritBeatFrame = {
  /** 0–1 light flash, peaks right after impact. */
  flash: number;
  /** 0–1 camera shake amplitude, gone before the push-in releases. */
  shake: number;
  /** 0–1 camera dolly toward the die; returns to 0 at the end. */
  push: number;
  /** 0–1 spark/shockwave lifetime progress. */
  burst: number;
  done: boolean;
};

export function isNaturalCrit(value: number): boolean {
  return value === 20;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export function critBeatFrame(elapsedMs: number): CritBeatFrame {
  const t = Math.max(0, elapsedMs);

  const flash =
    t < FLASH_ATTACK_MS
      ? t / FLASH_ATTACK_MS
      : (1 - clamp01((t - FLASH_ATTACK_MS) / FLASH_DECAY_MS)) ** 2;

  const shake = (1 - clamp01(t / SHAKE_MS)) ** 2;

  const releaseStart = PUSH_IN_MS + PUSH_HOLD_MS;
  const push =
    t < PUSH_IN_MS
      ? easeOutCubic(t / PUSH_IN_MS)
      : t < releaseStart
        ? 1
        : 1 - easeInOutSine(clamp01((t - releaseStart) / (CRIT_BEAT_MS - releaseStart)));

  const done = t >= CRIT_BEAT_MS;
  return {
    flash: done ? 0 : flash,
    shake: done ? 0 : shake,
    push: done ? 0 : push,
    burst: clamp01(t / BURST_MS),
    done,
  };
}
