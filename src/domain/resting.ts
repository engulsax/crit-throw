export const REST_LINEAR_THRESHOLD = 0.08;
export const REST_ANGULAR_THRESHOLD = 0.55;
export const REST_HOLD_MS = 500;

export type RestTracker = {
  stillSinceMs: number | null;
};

export function createRestTracker(): RestTracker {
  return { stillSinceMs: null };
}

export function updateRestTracker(
  tracker: RestTracker,
  linearSpeed: number,
  angularSpeed: number,
  nowMs: number
): boolean {
  const atRest =
    linearSpeed < REST_LINEAR_THRESHOLD &&
    angularSpeed < REST_ANGULAR_THRESHOLD;

  if (!atRest) {
    tracker.stillSinceMs = null;
    return false;
  }

  if (tracker.stillSinceMs === null) {
    tracker.stillSinceMs = nowMs;
    return false;
  }

  return nowMs - tracker.stillSinceMs >= REST_HOLD_MS;
}
